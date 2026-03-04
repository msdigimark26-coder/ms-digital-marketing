import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { reelsSupabase } from "@/integrations/supabase/reels-client";

interface ProtectionSettings {
    content_protection_enabled: boolean;
    devtools_protection_enabled: boolean;
    focus_blur_enabled: boolean;
    watermark_enabled: boolean;
}

/**
 * Content Protection Hook
 * Prevents copying, right-click, and other content extraction methods.
 * Includes DevTools detection, Focus-based blurring, and dynamic watermarks.
 * 
 * EXCLUDED: Admin portal (/admin) - full functionality for administrators
 */
export const useContentProtection = () => {
    const location = useLocation();
    const [settings, setSettings] = useState<ProtectionSettings>({
        content_protection_enabled: false,
        devtools_protection_enabled: false,
        focus_blur_enabled: false,
        watermark_enabled: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await reelsSupabase
                    .from('site_settings')
                    .select('key, value');

                if (error) {
                    console.error('Error fetching protection settings from Reels DB:', error);
                    return;
                }

                if (data) {
                    const newSettings: any = { ...settings };
                    data.forEach((item: any) => {
                        if (newSettings.hasOwnProperty(item.key)) {
                            newSettings[item.key] = item.value === true || item.value === 'true';
                        }
                    });
                    setSettings(newSettings);
                }
            } catch (err) {
                console.error('Failed to fetch site settings from Reels DB:', err);
            }
        };

        fetchSettings();

        // Real-time subscription for all site settings on Reels DB
        const channel = reelsSupabase
            .channel('site_settings_all_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_settings'
                },
                (payload: any) => {
                    const { key, value } = payload.new;
                    setSettings(prev => ({
                        ...prev,
                        [key]: value === true || value === 'true'
                    }));
                }
            )
            .subscribe();

        return () => {
            reelsSupabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const isAdmin = location.pathname.startsWith('/admin');
        if (isAdmin) {
            document.body.classList.remove('site-blur-protection');
            return;
        }

        // --- 1. Right Click & Keyboard Protection ---
        const handleContextMenu = (e: MouseEvent) => {
            if (settings.content_protection_enabled) {
                e.preventDefault();
                return false;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!settings.content_protection_enabled) return;

            // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U (view source)
            if (
                (e.ctrlKey || e.metaKey) &&
                ['c', 'x', 'a', 's', 'u'].includes(e.key.toLowerCase())
            ) {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                    e.preventDefault();
                    return false;
                }
            }

            // Disable F12, Ctrl+Shift+I, J, C (developer tools shortcuts)
            if (
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
            ) {
                e.preventDefault();
                return false;
            }
        };

        const handleSelectStart = (e: Event) => {
            if (!settings.content_protection_enabled) return;
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable && !target.classList.contains('allow-select')) {
                e.preventDefault();
                return false;
            }
        };

        // --- 2. Focus Blur (Anti-Screenshot) ---
        const handleBlur = () => {
            if (settings.focus_blur_enabled) {
                document.body.classList.add('site-blur-protection');
            }
        };

        const handleFocus = () => {
            document.body.classList.remove('site-blur-protection');
        };

        // --- 3. DevTools Detection (Stealth Mode) ---
        let devtoolsInterval: any;
        if (settings.devtools_protection_enabled) {
            devtoolsInterval = setInterval(() => {
                const widthDiff = window.outerWidth - window.innerWidth > 160;
                const heightDiff = window.outerHeight - window.innerHeight > 160;

                if (widthDiff || heightDiff) {
                    // DevTools likely open
                    document.body.innerHTML = `
                        <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#05030e; color:white; font-family:sans-serif; text-align:center; padding:20px;">
                            <h1 style="color:#ef4444;">Shield Active</h1>
                            <p style="color:#94a3b8;">Developer tools are restricted on this site to protect premium assets.</p>
                            <button onclick="window.location.reload()" style="margin-top:20px; padding:10px 20px; background:#8b5cf6; border:none; color:white; border-radius:8px; cursor:pointer;">Close DevTools to continue</button>
                        </div>
                    `;
                }
            }, 1000);
        }

        // Inject Protection Styles
        const styleId = 'ms-protection-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .site-blur-protection {
                    filter: blur(25px) grayscale(100%);
                    transition: filter 0.3s ease;
                    pointer-events: none;
                    user-select: none;
                }
                .ms-watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 5vw;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.03);
                    z-index: 9999;
                    pointer-events: none;
                    white-space: nowrap;
                    user-select: none;
                    text-transform: uppercase;
                    letter-spacing: 10px;
                }
                @media print {
                    body { display: none !important; }
                }
            `;
            document.head.appendChild(style);
        }

        // Manage Watermark
        const watermarkId = 'ms-global-watermark';
        if (settings.watermark_enabled && !document.getElementById(watermarkId)) {
            const wm = document.createElement('div');
            wm.id = watermarkId;
            wm.className = 'ms-watermark';
            wm.innerText = 'MS DIGI MARK • MS DIGI MARK';
            document.body.appendChild(wm);
        } else if (!settings.watermark_enabled && document.getElementById(watermarkId)) {
            document.getElementById(watermarkId)?.remove();
        }

        // Add Listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('selectstart', handleSelectStart);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('selectstart', handleSelectStart);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            if (devtoolsInterval) clearInterval(devtoolsInterval);
            document.body.classList.remove('site-blur-protection');
        };
    }, [location.pathname, settings]);
};
