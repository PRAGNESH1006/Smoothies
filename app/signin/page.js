"use client";
import supabase from "@/app/supabase/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";
import { useEffect } from "react";

function LogIn() {
  useEffect(() => {
    const newsession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
    };
    newsession();
  }, []);
  const customTheme = {
    default: {
      colors: {
        brand: "hsl(153 60.0% 53.0%)",
        brandAccent: "hsl(154 54.8% 45.1%)",
        brandButtonText: "white",
        // ..
      },
    },
    dark: {
      colors: {
        brandButtonText: "white",
        defaultButtonBackground: "#2e2e2e",
        defaultButtonBackgroundHover: "#3e3e3e",
        //..
      },
    },
    // You can also add more theme variations with different names.
    evenDarker: {
      colors: {
        brandButtonText: "white",
        defaultButtonBackground: "#1e1e1e",
        defaultButtonBackgroundHover: "#2e2e2e",
        //..
      },
    },
  };
  return (
    <div className="flex justify-center items-center  my-2">
      <div className="w-[90%] sm:w-[90%] md:w-[60%] lg:w-[50%] xl:w-[30%]">
        <div className="bg-[#0d1c24] p-4 rounded-lg w-full shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google", "discord", "github"]}
            theme="dark"
            className="fon"
          />
        </div>
      </div>
    </div>
  );
}

export default LogIn;
