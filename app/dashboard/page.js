"use client";
import React, { useEffect, useState } from "react";
import supabase from "@/app/supabase/supabaseClient";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Update } from "../components/Update";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [fetchError, setFetchError] = useState(null);
  const [smoothies, setSmoothies] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [orderBy, setOrderBy] = useState("created_at");
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        setCurrentUser(user);

        const { data: smoothieData, error: smoothieError } = await supabase
          .from("smoothies")
          .select()
          .order(orderBy, { ascending: false });

        if (smoothieError) {
          throw smoothieError;
        }

        const userSmoothies = smoothieData.filter(
          (item) => item.user_id === user?.id
        );

        setSmoothies(userSmoothies || []);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setFetchError("Could not fetch smoothies data");
        setSmoothies(null);
      }
    };

    fetchData();
  }, [orderBy]);

  const handleDelete = async (id) => {
    try {
      const { data, error } = await supabase
        .from("smoothies")
        .delete()
        .eq("id", id)
        .select();

      // for clearing smoothie from page
      setSmoothies((smoothies) => {
        return smoothies.filter((sm) => sm.id !== id);
      });

      if (error) {
        throw error;
      }

      console.log("User deleted successfully:", data);
      return data;
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw error;
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!newProfilePicture) return;

    try {
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(`${currentUser.id}/profile-picture`, newProfilePicture, {
          cacheControl: "3600",
        });

      if (error) {
        throw error;
      }

      const newProfilePictureUrl = data?.Key;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: newProfilePictureUrl,
        })
        .eq("id", currentUser.id);

      if (updateError) {
        throw updateError;
      }

      // Update the user object with the new avatar URL
      setCurrentUser((prevUser) => ({
        ...prevUser,
        user_metadata: {
          ...prevUser.user_metadata,
          avatar_url: newProfilePictureUrl,
        },
      }));

      console.log("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setNewProfilePicture(file);
  };

  return (
    <main className="flex flex-col items-center justify-center  gap-4 py-8 px-2 sm:px-4 lg:px-8 ">
      <div className="profile">
        <p className="profile-heading text-3xl text-white">Profile</p>
        <div className="profile-details flex flex-col sm:flex-row items-center bg-white bg-opacity-75 rounded-lg p-4">
          <div className="profile-picture mr-0 sm:mr-4 border-4 border-blue-200 rounded-full overflow-hidden">
            <img
              src={currentUser?.user_metadata.avatar_url}
              alt=""
              className="w-24 h-24 object-cover"
            />
          </div>
          <div className="profile-info text-center sm:text-left mt-2 sm:mt-0">
            <p className="text-lg text-blue-800">
              Name: {currentUser?.user_metadata.name}
            </p>
            <p className="text-lg text-blue-800">
              User Id: {currentUser?.email}
            </p>
          </div>
        </div>
      </div>
      <hr className="w-full border-blue-300" />
      <DropdownMenu className="w-full sm:w-auto mt-4">
        <DropdownMenuTrigger className="bg-[#16a34a] text-white px-4 py-2 rounded-md">
          Sort
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-green-300">
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOrderBy("created_at")}>
            <span className="self-center">
              {orderBy === "created_at" ? "•" : " "}
            </span>
            Time
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOrderBy("rating")}>
            <span className="self-center">
              {orderBy === "rating" ? "•" : " "}
            </span>
            Rating
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOrderBy("title")}>
            <span className="self-center">
              {orderBy === "title" ? "•" : " "}
            </span>
            Title
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {fetchError && <p>{fetchError}</p>}
      {smoothies && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mt-4">
          {smoothies.map((item) => (
            // info about smoothies
            <Card
              key={item.id}
              className="h-[320px] box-border rounded-lg relative bg-white bg-opacity-75 shadow-md transition-shadow hover:shadow-2xl bg-gradient-to-b from-gray-400 to-blue-400 "
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] overflow-auto">
                  <h3 className="text-lg text-gray-800">
                    <span className="text-[#6d15df] font-semibold">
                      Ingredients:{" "}
                    </span>
                    {item.ingredient}
                  </h3>
                  <h3 className="text-lg text-gray-800">
                    <span className="text-[#6d15df] font-semibold">
                      Method:{" "}
                    </span>
                    {item.method}
                  </h3>
                </div>

                <div className="flex text-white justify-center items-center absolute top-[-10px] right-[-10px] bg-[#6d15df] rounded-[6px] w-[30px] h-0 text-center p-[20px]">
                  {item.rating}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center items-center gap-4">
                {currentUser.id === item.user_id && (
                  <>
                    {/* updates */}
                    <Update item={item} />
                    {/* delete */}
                    <Button variant="destructive">
                      <AlertDialog className="">
                        <AlertDialogTrigger>Delete</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleDelete(item.id);
                              }}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Button>{" "}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
