
"use client";
import React, { useEffect } from 'react'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CreateCategories from '../../../../components/create-category'

const CreateCategory = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Admin authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  return (
    <>
      <CreateCategories />
    </>
  )
}

export default CreateCategory
