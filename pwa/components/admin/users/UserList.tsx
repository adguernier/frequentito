import {
  FieldGuesser,
  ListGuesser,
  type ListGuesserProps,
} from "@api-platform/admin";

export const UserList = (props: ListGuesserProps) => (
  <ListGuesser {...props}>
    <FieldGuesser source={"email"} />
    <FieldGuesser source={"roles"} />
    <FieldGuesser source={"userIdentifier"} />
  </ListGuesser>
);
