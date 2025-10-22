import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  DateInput,
  ReferenceInput,
  SelectInput,
} from "react-admin";

export const PresenceEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" disabled />
      <ReferenceInput source="user_id" reference="profiles">
        <SelectInput
          optionText={(record: any) =>
            `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
            record.id
          }
        />
      </ReferenceInput>
      <DateInput source="day" />
      <BooleanInput source="am" label="Present in Morning" />
      <BooleanInput source="pm" label="Present in Afternoon" />
      <TextInput source="note" multiline />
    </SimpleForm>
  </Edit>
);
