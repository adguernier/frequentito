import { PresenceCreate } from "./Create";
import { PresenceEdit } from "./Edit";
import { PresenceList } from "./List";

export const presence = {
  list: PresenceList,
  edit: PresenceEdit,
  create: PresenceCreate,
  name: "presences",
};
