import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { NextJsIcon, P100Icon, PrismaIcon, QuickIcon, SecurityIcon } from "@/components/icons";
import Link from "next/link";
import { SlEmotsmile, SlCallEnd, SlGhost } from "react-icons/sl";
import { features } from "./features";
import Feature from "./feature";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userEvaluation } from "./user-evaluation";
import SubscribeBox from "./subscribe-box";
import AppFooter from "./app-footer";

export default async function Home() {
  const t = await getTranslations("Home")
  return (
    <main className="flex flex-col gap-4 items-center justify-center h-full">
      <section className="flex items-center justify-center space-y-6 py-12 sm:py-20 lg:py-20">
        <div className="text-center flex flex-col gap-y-5 container justify-center items-center">
          <h1
            className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
            {t("Slogan")}<br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text font-extrabold">{t("ProductName")}</span>
          </h1>
          <p className="text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {t("Uses")}
          </p>

          <div>
            <Button className="rounded-3xl" asChild>
              <Link href="/price">{t("WatchPrice")}<ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="flex">
        <div className="rounded-xl md:bg-muted/30 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
          <Image
            className={"max-w-4xl aspect-[3180/2160] size-full object-cover object-center dark:opacity-85 dark:invert"}
            src={"/images/image.jpg"} width={3180} height={2160} alt={"image"} />
        </div>
      </section>

      <section className="flex flex-col justify-center items-center gap-y-4 py-20">
        <div className="py-4">
          <span className="text-center uppercase text-md bg-gradient-to-r from-pink-500 to-green-500 text-transparent bg-clip-text font-extrabold">{t("PoweredBy")}</span>
        </div>
        <div className="flex flex-wrap gap-x-20 gap-y-4">
          <div className="text-primary cursor-pointer">
            <Link href="https://nextjs.org/">
              <NextJsIcon size={40} />
            </Link>
          </div>
          <div className="text-primary cursor-pointer">
            <Link href="https://www.prisma.io/">
              <PrismaIcon size={40} />
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap justify-center items-center gap-4 p-20">
        <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl border py-10 px-20">
          <P100Icon size={100} />
          <span className="text-2xl font-semibold text-center">{t("Customizable")}</span>
        </div>
        <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl border py-10 px-20">
          <SecurityIcon size={100} />
          <span className="text-2xl font-semibold text-center">{t("Reliable")}</span>
        </div>
        <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl  border py-10 px-20">
          <QuickIcon size={100} />
          <span className="text-2xl font-semibold text-center">{t("QuickStart")}</span>
        </div>
      </section>


      <section className="container flex flex-col  items-center gap-y-20 py-20">
        <div className="flex gap-x-4 gap-y-4 rounded-xl  border p-5 max-w-5xl">
          <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl">
            <div className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold">{t("Empower")}</h2>
              <p className="text-sm text-muted-foreground">{t("EmpowerDesc")}</p>
            </div>
            <div className="flex flex-col gap-y-10">
              <div className="flex  items-center gap-x-4">
                <SlEmotsmile size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower1")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc1")}</p>
                </div>
              </div>
              <div className="flex  items-center gap-x-4">
                <SlCallEnd size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower2")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc2")}</p>
                </div>
              </div>
              <div className="flex  items-center gap-x-4">
                <SlGhost size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower3")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc3")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl">
            <Image
              className={"max-w-lg aspect-[3180/2160] size-full object-cover object-center dark:opacity-85 dark:invert"}
              src={"/images/image.jpg"} width={3180} height={2160} alt={"image"} />
          </div>
        </div>

        <div className="flex gap-x-4 gap-y-4 rounded-xl  border p-5 max-w-5xl">
          <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl">
            <Image
              className={"max-w-lg aspect-[3180/2160] size-full object-cover object-center dark:opacity-85 dark:invert"}
              src={"/images/image.jpg"} width={3180} height={2160} alt={"image"} />
          </div>
          <div className="flex flex-col gap-x-20 gap-y-4 rounded-xl">
            <div className="flex flex-col gap-y-4">
              <h2 className="text-2xl font-semibold">{t("Empower7")}</h2>
              <p className="text-sm text-muted-foreground">{t("EmpowerDesc7")}</p>
            </div>
            <div className="flex flex-col gap-y-10">
              <div className="flex  items-center gap-x-4">
                <SlEmotsmile size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower4")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc4")}</p>
                </div>
              </div>
              <div className="flex  items-center gap-x-4">
                <SlCallEnd size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower5")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc5")}</p>
                </div>
              </div>
              <div className="flex  items-center gap-x-4">
                <SlGhost size={20} />
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-semibold">{t("Empower6")}</h3>
                  <p className="text-sm text-muted-foreground">{t("EmpowerDesc6")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="flex flex-col justify-center items-center gap-y-20 py-20">
        <div className="flex flex-col gap-y-4 justify-center items-center">
          <h2 className="bg-gradient-to-r from-pink-500 to-yellow-600 text-transparent bg-clip-text font-extrabold text-4xl">{t("Features")}</h2>
          <Button className="rounded-3xl p-4" asChild><Link href="/docs">{t("ToDocs")}<ArrowRight /></Link></Button>
        </div>
        <div className="container flex justify-center items-center flex-wrap gap-4">
          {
            features(t).map((feature, i) => (
              <Feature key={i} title={feature.title} description={feature.description} docs={feature.docs} icon={feature.icon} />
            ))
          }
        </div>

      </section>

      <section className="flex flex-col justify-center items-center gap-y-20 py-20">
        <div className="flex flex-col gap-y-4">
          <h2 className="bg-gradient-to-r from-pink-500 to-yellow-600 text-transparent bg-clip-text font-extrabold text-4xl">{t("UserEvaluation")}</h2>
        </div>
        <div className="container max-w-6xl flex flex-wrap gap-4 justify-center items-center">
          {
            userEvaluation(t).map((user, i) => (
              <div className="flex flex-col gap-y-4 max-w-xs rounded-md border p-4" key={i}>
                <div className="flex items-center gap-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>AV</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-md font-semibold">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.title}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-md text-muted-foreground">{user.description}</p>
                </div>
              </div>
            ))
          }
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
