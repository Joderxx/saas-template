import moment from "moment/moment";
import { useTranslations } from "next-intl";

export default function NotionHeader({properties, title}) {
  const t = useTranslations("General")
  return (
    properties ? (
      <>
        <h1 className="text-4xl font-bold pb-6">{title}</h1>
        <div className="flex flex-col gap-y-2 text-sm text-primary/80">
          <div className="flex gap-x-2">
            <span>{t("Author")}: </span>
            <span>{properties["Author"]["people"][0]["name"]}</span>
          </div>
          <div className="flex gap-x-2">
            <span>{t("Publish Date")}: </span>
            <span>{moment(new Date(properties["Publish Date"]["date"]["start"])).format("YYYY-MM-DD HH:mm")}</span>
          </div>
          <div className="flex gap-x-2">
            <span>{t("Tags")}: </span>
            <div className="flex gap-x-2">{properties["Tags"]["multi_select"].map(e => (
              <span key={e} className="px-2 rounded-md text-foreground"
                    style={{backgroundColor: e.color}}>{e.name}</span>))}</div>
          </div>
        </div>
      </>
    ) : <div></div>
  )
}