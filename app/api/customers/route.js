import { NextResponse } from 'next/server';
import { all, insert, update, remove } from '../../../lib/db.js';

export async function GET() {
  try {
    const customers = all('customer');
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, nomor_telepon, alamat } = body;

    if (!nama || !nomor_telepon) {
      return NextResponse.json({ error: 'Nama and nomor_telepon are required' }, { status: 400 });
    }

    const id = insert('customer', { nama, nomor_telepon, alamat });
    return NextResponse.json({ id, message: 'Customer added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding customer:', error);
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama, nomor_telepon, alamat } = body;

    if (!id || !nama || !nomor_telepon) {
      return NextResponse.json({ error: 'ID, nama, and nomor_telepon are required' }, { status: 400 });
    }

    update('customer', id, { nama, nomor_telepon, alamat });
    return NextResponse.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    remove('customer', id);
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
