import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios-private/AxiosPrivate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthProvider";

const Login = () => {
  const [loginMode, setLoginMode] = useState(true);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { userId, authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      navigate("/home");
    }
  }, [userId]);

  const handleInputChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const url = loginMode ? "/api/login" : "/api/signup";
    try {
      const response = await api.post(url, data);
      setData({
        email: "",
        password: "",
      });
      if (loginMode) {
        if (response.status === 200) {
          authLogin(response.data.data.id);
        }
      } else {
        if (response.status === 201) {
          setLoginMode(true);
          toast("User created successfully");
        }
      }
    } catch (e) {
      toast(e.response.data.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center w-2/5 h-screen bg-[oklch(0.795_0.184_86.047)]"></div>
      <div className="flex items-center justify-center w-3/5 h-screen">
        <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px] ">
          <div className="grid gap-6">
            <CardHeader className="text-center bg-background text-foreground">
              <CardTitle className="text-xl">
                {loginMode ? "Login" : "Signup"}
              </CardTitle>
              <CardDescription>
                Enter your email and password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={handleInputChange}
                  />
                </Field>

                <Field>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={handleInputChange}
                  />
                </Field>

                <Field>
                  <Button variant="default" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Field>
              </FieldGroup>
              <FieldSeparator />
              <div className="flex justify-center">
                {loginMode
                  ? "Create new account? "
                  : "Already have an account? "}

                <a
                  href="#"
                  onClick={() => {
                    setLoginMode((prev) => !prev);
                  }}
                >
                  {loginMode ? "Signup" : "Login"}
                </a>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
