"use client";
import { useParams } from "next/navigation";
import supabase from "@/app/supabase/supabaseClient";
import React, { useEffect, useState } from "react";

function Page() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("");
  const [rating, setRating] = useState("");
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  // const navigate = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("smoothies")
          .select()
          .eq("id", id)
          .single();

        setLoading(false);
        setTitle(data.title);
        setMethod(data.method);
        setRating(data.rating);
        console.log(data);
      } catch (error) {
        setFormError("Not found Data");
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !method.trim() || !rating) {
      setFormError("Please fill all the fields");
      return;
    }
    setFormError(null);
    setLoading(true);

    try {
      const SmoothieData = await supabase
        .from("smoothies")
        .update([
          {
            title,
            method,
            rating,
          },
        ])
        .eq("id", id)
        .select();
      console.log(SmoothieData);
      setLoading(false);
      setSuccessMessage("Successfully added smoothies");
      window.location.href = "/";
    } catch (error) {
      setFormError(error.message);
      console.log(error);
    }
  };

  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (!isNaN(inputValue) && Number(inputValue) <= 10) {
      setRating(inputValue);
    }
  };

  return (
    <div className=" flex flex-col gap-2 justify-center items-center ">
      <form
        onSubmit={handleSubmit}
        value={id}
        className="h-[60vh] my-10 flex flex-col gap-2 justify-center  w-[400px] rounded-lg px-4 py-4  bg-[#102632] "
      >
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className=" px-2 py-2 bg-[#92a9a7] text-black rounded-lg h-10"
        />
        <label htmlFor="method">Method:</label>
        <textarea
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className=" px-2 py-2 bg-[#92a9a7] text-black rounded-lg h-20"
        />
        <label htmlFor="rating">Ratting(0-10):</label>
        <input
          type="number"
          id="rating"
          value={rating}
          max={10}
          min={0}
          onChange={handleChange}
          placeholder="Enter a number up to 10"
          className="bg-[#92a9a7] text-black rounded-lg h-10  text-center"
        />
        <button className="bg-[#92a9a7] text-black rounded-lg h-10 ">
          {loading ? "Loading..." : "Update Smoothie"}
        </button>

        {formError && (
          <p style={{ textAlign: "center", marginTop: "5px" }}>{formError}</p>
        )}
        {successMessage && (
          <p style={{ textAlign: "center", marginTop: "5px" }}>
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}

export default Page;