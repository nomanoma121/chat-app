import { Card } from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { css } from "styled-system/css";
import { Settings } from "lucide-react";

interface UserPanelProps {
  name?: string;
  iconUrl?: string;
}

export const UserPanel = ({ name, iconUrl }: UserPanelProps) => {
  return (
    <Card.Root
      className={css({
        width: "100%",
        height: "14",
        background: "bg.primary",
        borderRadius: "md",
        boxShadow: "md",
      })}
    >
      <Card.Body
        className={css({
          display: "flex",
          flexDirection: "row",
          height: "100%",
          padding: "1",
          gap: "1",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            borderRadius: "md",
            padding: "3",
            width: "90%",
            _hover: {
              background: "bg.quaternary",
              cursor: "pointer",
            },
          })}
        >
          <Avatar
            src={iconUrl}
            name="User Avatar"
            className={css({
              width: "7",
              height: "7",
            })}
          />
          <p
            className={css({
              marginLeft: "2",
            })}
          >
            {name}
          </p>
        </div>
        <div className={css({ display: "flex", alignItems: "center" })}>
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              padding: "2",
              marginRight: "2",
              height: "8",
              _hover: {
                cursor: "pointer",
                background: "bg.quaternary",
                borderRadius: "md",
              },
            })}
          >
            <Settings
              className={css({
                width: "4",
                height: "4",
                color: "text.bright",
              })}
            />
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
};
