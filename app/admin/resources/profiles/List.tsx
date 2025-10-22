import { BooleanField, DataTable, ImageField, List } from "react-admin";

export const ProfileList = () => (
  <List>
    <DataTable rowClick="edit">
      <DataTable.Col source="first_name" label="First Name" />
      <DataTable.Col source="last_name" label="Last Name" />
      <DataTable.Col source="avatar_url" field={ImageField} />
      <DataTable.Col
        source="notifications_enabled"
        label="Notifications"
        field={BooleanField}
      />
    </DataTable>
  </List>
);
