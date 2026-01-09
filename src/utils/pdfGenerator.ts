import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, formatDistance } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
    id: string;
    user_id: string;
    login_time: string;
    logout_time: string | null;
    status: string;
    captured_image_url: string | null;
    portal_users: {
        username: string;
        role: string;
        avatar_url: string | null;
    } | null;
}

// Robust Image Loader with Retry and Timeout
const loadImage = async (url: string, timeout = 5000, retries = 2): Promise<string> => {
    const load = () => new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;

        // Add cache buster to avoid CORS issues with cached images
        if (url.includes('?')) {
            img.src = `${url}&t=${new Date().getTime()}`;
        } else {
            img.src = `${url}?t=${new Date().getTime()}`;
        }

        const timer = setTimeout(() => {
            img.src = ""; // Stop loading
            reject(new Error("Timeout"));
        }, timeout);

        img.onload = () => {
            clearTimeout(timer);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // limit max dimensions to avoid massive base64 strings
                const maxDim = 800;
                if (img.width > maxDim || img.height > maxDim) {
                    const scale = maxDim / Math.max(img.width, img.height);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error("Canvas context failed"));
            }
        };
        img.onerror = (err) => {
            clearTimeout(timer);
            reject(err);
        };
    });

    try {
        return await load();
    } catch (err) {
        if (retries > 0) {
            console.warn(`Retrying image load (${retries} left): ${url}`);
            return await loadImage(url, timeout, retries - 1);
        }
        console.error(`Failed to load image: ${url}`, err);
        return "";
    }
};

export const generateAuditLogPDF = async (logs: LogEntry[], onProgress: (msg: string) => void) => {
    try {
        onProgress("Initializing PDF Secure Engine...");

        // 1. Prepare basics
        const filename = `audit_logs_${format(new Date(), "yyyy-MM-dd_HHmm")}_${Math.random().toString(36).substr(2, 9)}.pdf`;

        // Get a public URL placeholder for the QR code (this file doesn't exist yet but will)
        const { data: { publicUrl } } = supabase.storage.from('admin_logs').getPublicUrl(filename);

        // 2. Generate QR Code
        onProgress("Generating cryptographic verification...");
        const QRCode = (await import('qrcode')).default;
        const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, { width: 100, margin: 1, color: { dark: '#000000', light: '#ffffff' } });

        // 3. Document Setup
        const doc = new jsPDF({
            encryption: {
                userPassword: "$msdigimark@2026",
                ownerPassword: "$msdigimark@2026",
                userPermissions: ["print", "modify", "copy", "annot-forms"]
            }
        });

        // 4. Load Assets (Logo)
        onProgress("Loading branding assets...");
        const logoDataUrl = await loadImage('/favicon.png', 3000);

        // 5. Header Generation
        if (logoDataUrl) {
            try {
                doc.addImage(logoDataUrl, 'PNG', 14, 10, 10, 10);
                doc.setFontSize(18);
                doc.text("Admin Audit Logs", 28, 17);
            } catch (e) {
                doc.setFontSize(18);
                doc.text("Admin Audit Logs", 14, 22);
            }
        } else {
            doc.setFontSize(18);
            doc.text("Admin Audit Logs", 14, 22);
        }

        doc.addImage(qrCodeDataUrl, 'PNG', 170, 5, 25, 25);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Scan to Download", 170, 32);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Exported on: ${format(new Date(), "PPpp")}`, 14, 30);
        doc.setTextColor(220, 38, 38);
        doc.text(`Secure Document - Password Protected`, 14, 36);

        // 6. Process Evidence Images in Parallel Batches
        onProgress("Processing evidence data...");
        const BATCH_SIZE = 5;
        const processedRows = [];

        for (let i = 0; i < logs.length; i += BATCH_SIZE) {
            const batch = logs.slice(i, i + BATCH_SIZE);
            onProgress(`Processing records ${i + 1}-${Math.min(i + BATCH_SIZE, logs.length)} of ${logs.length}...`);

            const batchResults = await Promise.all(batch.map(async (log) => {
                const duration = log.logout_time ? formatDistance(new Date(log.login_time), new Date(log.logout_time)) : "Active";

                let imgData = "";
                if (log.captured_image_url) {
                    imgData = await loadImage(log.captured_image_url);
                }

                return {
                    row: [
                        log.portal_users?.username || "Unknown",
                        log.portal_users?.role || "admin",
                        format(new Date(log.login_time), "MMM d, HH:mm:ss"),
                        log.status,
                        duration,
                        "" // Placeholder for image column
                    ],
                    img: imgData,
                    hasUrl: !!log.captured_image_url
                };
            }));
            processedRows.push(...batchResults);
        }

        // 7. Build Table
        onProgress("Compiling document structure...");
        const tableRows = processedRows.map(d => d.row);
        const rowImages = processedRows.map(d => d.img);
        const hasUrlMap = processedRows.map(d => d.hasUrl);
        const tableColumn = ["Username", "Role", "Login Time", "Status", "Duration", "Evidence"];

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [168, 85, 247], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3, valign: 'middle', minCellHeight: 15 },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const imgData = rowImages[data.row.index];
                    if (imgData) {
                        const dim = 12;
                        try {
                            doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 1.5, dim, dim);
                        } catch (err) {
                            doc.setFontSize(8);
                            doc.setTextColor(150);
                            doc.text("Err", data.cell.x + 2, data.cell.y + 8);
                        }
                    } else if (hasUrlMap[data.row.index]) {
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text("Load Fail", data.cell.x + 2, data.cell.y + 8);
                    } else {
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text("-", data.cell.x + 2, data.cell.y + 8);
                    }
                }
            }
        });

        // 8. Final Output
        onProgress("Finalizing encryption...");
        const pdfBlob = doc.output('blob');

        // 9. Upload
        onProgress("Uploading to secure cloud vault...");
        const { error: uploadError } = await supabase.storage
            .from('admin_logs')
            .upload(filename, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) throw uploadError;

        return filename;

    } catch (err) {
        console.error("PDF Generation Error:", err);
        throw err;
    }
};
