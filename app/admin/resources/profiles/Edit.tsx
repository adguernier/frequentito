import { BooleanInput, Edit, SimpleForm, TextInput } from "react-admin";

export const ProfileEdit = () => (
  <Edit mutationMode="pessimistic">
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="first_name" label="First Name" />
      <TextInput source="last_name" label="Last Name" />
      <TextInput source="avatar_url" label="Avatar URL" />
      <BooleanInput
        source="notifications_enabled"
        label="Notifications Enabled"
      />
    </SimpleForm>
  </Edit>
);
