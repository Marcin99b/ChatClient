import { Box, Button, List, ListItem } from "@chakra-ui/react";
import { FC } from "react";

export const RoomsList: FC<{
  baseAddress: string;
  ids: string[];
  refreshRooms: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
}> = ({ baseAddress, ids, refreshRooms, joinRoom }) => (
  <Box>
    <List spacing={3}>
      {ids.map((id) => (
        <ListItem>
          {id}{" "}
          <Button colorScheme="blue" onClick={async () => await joinRoom(id)}>
            Join
          </Button>
          <Button
            colorScheme={"red"}
            onClick={async () => {
              //await deleteRoom(baseAddress, id);
              await refreshRooms();
            }}
          >
            Delete
          </Button>
        </ListItem>
      ))}
    </List>
  </Box>
);
