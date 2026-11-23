'use client'

import { useRouter } from "next/navigation";
import { AppButton } from "@/components/shared/AppButton";
import { Heading } from "@/components/shared/Heading";
import { CirclePlus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Header() {
  const router = useRouter();
  const t = useTranslations("roleAndPermissions");

  const handleAddRole = () => {
    router.push('/general/role-and-permissions/add-role');
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <Heading title={t("title")} />
        <div className="flex gap-2 items-center">
          <AppButton leftIcon={<CirclePlus size={16} />} onClick={handleAddRole}>
            {t("addRole")}
          </AppButton>
        </div>
      </div>
    </div>
  )
}
