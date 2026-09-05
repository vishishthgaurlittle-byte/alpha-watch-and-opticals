import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OAuth Authentication"
};

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
