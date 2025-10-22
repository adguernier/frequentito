import {
  Create,
  SimpleForm,
  BooleanInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  TextInput,
  required,
} from "react-admin";

export const PresenceCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="user_id" reference="profiles">
        <SelectInput
          validate={required()}
          optionText={(record: any) =>
            `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
            record.id
          }
        />
      </ReferenceInput>
      <DateInput
        source="day"
        validate={required()}
        defaultValue={new Date().toISOString().split("T")[0]}
      />
      <BooleanInput
        source="am"
        label="Present in Morning"
        defaultValue={false}
      />
      <BooleanInput
        source="pm"
        label="Present in Afternoon"
        defaultValue={false}
      />
      <TextInput source="note" multiline />
    </SimpleForm>
  </Create>
);
