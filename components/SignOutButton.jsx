import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { PiSignOutBold } from "react-icons/pi";
const SignOutButton = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex items-center justify-center w-full gap-2">
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="btn w-full rounded-md   bg-red-500 text-white"
      >
        {t("signOut")}
        <PiSignOutBold className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SignOutButton;
