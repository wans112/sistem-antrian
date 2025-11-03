"use client";

import { useState, useEffect } from "react";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.jsx";
import { Button } from "../ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog.jsx";
import { Input } from "../ui/input.jsx";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    nomor_telepon: "",
    alamat: "",
  });

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          console.error('Failed to fetch customers');
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update customer
        await fetch('/api/customers', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
      } else {
        // Add new customer
        await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      // Refresh list
      const dataRes = await fetch('/api/customers');
      const data = await dataRes.json();
      setCustomers(data);
      // Reset form
      setFormData({ nama: "", nomor_telepon: "", alamat: "" });
      setIsEditing(false);
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle edit
  const handleEdit = (customer) => {
    setIsEditing(true);
    setEditingId(customer.id);
    setFormData({
      nama: customer.nama,
      nomor_telepon: customer.nomor_telepon,
      alamat: customer.alamat,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
      try {
        await fetch('/api/customers', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        // Refresh list
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Customer</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Tambah Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Customer' : 'Tambah Customer Baru'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Edit data customer.' : 'Masukkan data customer baru.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="nama" className="text-right">
                    Nama
                  </label>
                  <Input
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="nomor_telepon" className="text-right">
                    Telepon
                  </label>
                  <Input
                    id="nomor_telepon"
                    name="nomor_telepon"
                    value={formData.nomor_telepon}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="alamat" className="text-right">
                    Alamat
                  </label>
                  <Input
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? 'Update' : 'Simpan'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.nama}</TableCell>
                <TableCell>{customer.nomor_telepon}</TableCell>
                <TableCell>{customer.alamat}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEdit(customer)}>
                    <EditIcon />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
                    <TrashIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
