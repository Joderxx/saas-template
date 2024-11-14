export const permissions = (t: (key: string) => string) => ([
  
  { label: t("All"), value: "*" },
  { label: t("UserAll"), value: "USER_*" },
  { label: t("AddApi"), value: "USER_API_ADD" },
  { label: t("EditApi"), value: "USER_API_EDIT" },
  { label: t("DeleteApi"), value: "USER_API_DELETE" },
  { label: t("ListApi"), value: "USER_API_LIST" },

  { label: t("AddUser"), value: "ADMIN_USER_ADD" },
  { label: t("EditUser"), value: "ADMIN_USER_EDIT" },
  { label: t("DeleteUser"), value: "ADMIN_USER_DELETE" },
  { label: t("ListUser"), value: "ADMIN_USER_LIST" },

  { label: t("AddProduct"), value: "ADMIN_PRODUCT_ADD" },
  { label: t("EditProduct"), value: "ADMIN_PRODUCT_EDIT" },
  { label: t("DeleteProduct"), value: "ADMIN_PRODUCT_DELETE" },
  { label: t("ListProduct"), value: "ADMIN_PRODUCT_LIST" },

  { label: t("ChartView"), value: "ADMIN_CHART_VIEW" },
  { label: t("PanelView"), value: "ADMIN_PANEL_VIEW" },


  { label: t("AddRole"), value: "ADMIN_ROLE_ADD" },
  { label: t("EditRole"), value: "ADMIN_ROLE_EDIT" },
  { label: t("DeleteRole"), value: "ADMIN_ROLE_DELETE" },
  { label: t("ListRole"), value: "ADMIN_ROLE_LIST" },
])