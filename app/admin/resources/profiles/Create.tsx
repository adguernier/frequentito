import {
  BooleanInput,
  Create,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ProfileCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="id" validate={required()} label="User ID" />
      <TextInput source="first_name" label="First Name" />
      <TextInput source="last_name" label="Last Name" />
      <TextInput source="avatar_url" label="Avatar URL" />
      <BooleanInput
        source="notifications_enabled"
        label="Notifications Enabled"
        defaultValue={true}
      />
    </SimpleForm>
  </Create>
);
