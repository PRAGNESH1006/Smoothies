"use client";
import { useState } from "react";
import supabase from "@/app/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProduct() {
  // State to manage form input values
  const [formData, setFormData] = useState({
    juicename: "",
    fruit: "",
    price: "",
    img: "",
    ml: "",
  });

  // State to manage image preview URL
  const [preview, setPreview] = useState("");

  // State for success and error messages
  const [loading, setLoading] = useState(false);

  // Hook to programmatically navigate
  const router = useRouter();

  // Handle changes in form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file upload and image preview
  const handleUpload = async (e) => {
    setLoading(true);
    let file;
    if (e.target.files) {
      file = e.target.files[0];

      // Set preview URL for image
      setPreview(URL.createObjectURL(file));

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("juice-images")
        .upload("public/" + file?.name, file);

      if (data) {
        // Get public URL of the uploaded image
        const { data: publicData } = supabase.storage
          .from("juice-images")
          .getPublicUrl("public/" + file?.name);

        console.log("Public URL:", publicData.publicUrl);

        // Update form data with the image URL
        setFormData((prevData) => ({
          ...prevData,
          img: publicData.publicUrl,
        }));
        toast.success("Image uploaded successfully!");
        setLoading(false);
      } else if (error) {
        console.log("File upload error:", error);
        toast.error("Failed to upload image. Please try again.");
        setLoading(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Extract form data
    const { juicename, fruit, price, img, ml } = formData;

    // Insert data into Supabase table
    const { data, error } = await supabase
      .from("juice_products")
      .insert([{ juicename, fruit, price, img, ml }]);

    if (error) {
      console.error("Error inserting data:", error);
      toast.error("Failed to add product. Please try again.");
    } else {
      toast.success("Product added successfully!");
      router.push("/components/collection");
      setFormData({
        juicename: "",
        fruit: "",
        price: "",
        img: "",
        ml: "",
      });
      setPreview(""); // Clear preview after successful submission
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-lg p-6 bg-gray-50 shadow-lg rounded-lg my-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700">
        Add New Juice Product
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-800">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
            id="file_input"
            onChange={handleUpload}
          />
        </div>
        {/* Display image preview if available */}
        {preview && (
          <div className="mb-4 text-center">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Juice Name
          </label>
          <input
            type="text"
            name="juicename"
            value={formData.juicename}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Fruit
          </label>
          <input
            type="text"
            name="fruit"
            value={formData.fruit}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Price (₹)
          </label>
          <input
            type="number"
            step="5"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Milliliters (ml)
          </label>
          <input
            type="number"
            step="10"
            name="ml"
            value={formData.ml}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || !formData.img}
            className="w-full inline-flex justify-center py-3 px-5 border border-transparent shadow-lg text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? "Loading..." : "Add Product"}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
