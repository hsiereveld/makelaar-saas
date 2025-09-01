'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  city: string;
}

export default function DashboardPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/${tenant}/properties`)
      .then(res => res.json())
      .then(data => {
        setProperties(data.data);
        setLoading(false);
      });
  }, [tenant]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard - {tenant}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Properties</h3>
          <p className="text-3xl font-bold">{properties.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Leads</h3>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">This Month</h3>
          <p className="text-3xl font-bold">€2.4M</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Properties</h2>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-4">Title</th>
                <th className="text-left pb-4">City</th>
                <th className="text-left pb-4">Bedrooms</th>
                <th className="text-left pb-4">Price</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property.id} className="border-b">
                  <td className="py-4">{property.title}</td>
                  <td className="py-4">{property.city}</td>
                  <td className="py-4">{property.bedrooms}</td>
                  <td className="py-4">€{property.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
