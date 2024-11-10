import { SectionHeader } from "@app/parameters/header";
import React from "react";

export const Section = ({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) => (
  <section className="p-12">
    <SectionHeader title={title} />
    {children}
  </section>
);
