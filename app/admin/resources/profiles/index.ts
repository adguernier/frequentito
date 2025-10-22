import { ProfileCreate } from "./Create";
import { ProfileEdit } from "./Edit";
import { ProfileList } from "./List";

export const profile = {
  list: ProfileList,
  edit: ProfileEdit,
  create: ProfileCreate,
  name: "profiles",
};
