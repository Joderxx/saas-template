import { FaAddressBook, FaBlog, FaChartLine, FaComputer, FaDollarSign, FaFileWord, FaFingerprint, FaProductHunt, FaRegUser } from "react-icons/fa6";
import { AiFillSetting } from "react-icons/ai";
import { RiMoneyDollarBoxFill, RiProductHuntLine } from "react-icons/ri";
import { Role } from "@/lib/role-utils";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, USER_ROLE } from "@/lib/utils";
export interface RouteGroup {
  name: string;
  routes: Route[];
}

interface Route {
  path: string;
  name: string;
  icon: React.ReactNode;
  auth: (user: Role) => boolean
}

export const routes = (t: (key: string) => string) => (
  [
    {
      name: t("Menu"),
      routes: [
        {
          path: "/admin/panel",
          name: t("AdminPanel"),
          icon: <FaComputer />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/super-admin/billing-management",
          name: t("BillingManagement"),
          icon: <RiMoneyDollarBoxFill size={18} />,
          auth: (user) => user.atLeast(SUPER_ADMIN_ROLE)
        },
        {
          path: "/dashboard/billing",
          name: t("Billing"),
          icon: <FaDollarSign size={18} />,
          auth: (user) => user.atLeast(USER_ROLE)
        },
        {
          path: "/admin/chart",
          name: t("Chart"),
          icon: <FaChartLine size={18} />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/dashboard/api-keys",
          name: t("ApiKey"),
          icon: <FaFingerprint />,
          auth: (user) => user.atLeast(USER_ROLE)
        },
        {
          path: "/admin/user",
          name: t("UserList"),
          icon: <FaRegUser />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/admin/role",
          name: t("RoleList"),
          icon: <FaAddressBook />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/admin/docs-management",
          name: t("DocsManagement"),
          icon: <FaFileWord />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/admin/blog-management",
          name: t("BlogManagement"),
          icon: <FaBlog />,
          auth: (user) => user.atLeast(ADMIN_ROLE)
        },
        {
          path: "/super-admin/product-management",
          name: t("ProductManagement"),
          icon: <RiProductHuntLine size={20} />,
          auth: (user) => user.atLeast(SUPER_ADMIN_ROLE)
        },
        {
          path: "/dashboard/product",
          name: t("Product"),
          icon: <FaProductHunt size={18} />,
          auth: (user) => user.atLeast("VIP_1")
        }
      ]
    },
    {
      name: "选项",
      routes: [
        {
          path: "/dashboard/settings",
          name: t("Setting"),
          icon: <AiFillSetting size={20} />,
          auth: (user) => user.atLeast(USER_ROLE)
        },
        {
          path: "/docs",
          name: t("Docs"),
          icon: <FaFileWord size={20} />,
          auth: (user) => user.atLeast(USER_ROLE)
        },
      ]
    }
  ] as RouteGroup[]
)
