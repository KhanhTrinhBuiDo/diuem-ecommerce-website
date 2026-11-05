import { redirect } from "next/navigation";

// TODO(auth): chưa đăng nhập → mở popup đăng nhập.
export default function Page() {
  redirect("/tai-khoan/ho-so");
}
