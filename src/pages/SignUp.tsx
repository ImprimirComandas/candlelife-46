
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  const navigate = useNavigate();

  const toggleView = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-4 animate-fade-in">
        <Card className="rounded-2xl border-0 shadow-xl backdrop-blur-lg bg-white/90 dark:bg-gray-950/90">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Criar conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpForm toggleView={toggleView} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
