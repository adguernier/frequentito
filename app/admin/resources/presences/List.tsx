import {
  List,
  TextField,
  BooleanField,
  DateField,
  ReferenceField,
  FunctionField,
  DataTable,
} from "react-admin";

export const PresenceList = () => (
  <List>
    <DataTable rowClick="edit">
      <DataTable.Col>
        <ReferenceField source="user_id" reference="profiles" label="User">
          <FunctionField
            render={(record: any) =>
              `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
              record.id
            }
          />
        </ReferenceField>
      </DataTable.Col>
      <DataTable.Col field={DateField} source="day" />
      <DataTable.Col field={BooleanField} source="am" label="Morning" />
      <DataTable.Col field={BooleanField} source="pm" label="Afternoon" />
      <DataTable.Col field={TextField} source="note" />
    </DataTable>
  </List>
);
