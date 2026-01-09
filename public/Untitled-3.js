import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../src/lib/supabaseServerClient';
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ limit: 1 });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, users: data.length });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function query(text, params) {
  return (await pool.query(text, params));
}