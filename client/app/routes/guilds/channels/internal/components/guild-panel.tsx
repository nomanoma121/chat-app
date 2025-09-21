import { Settings, UserRoundPlus, Plus } from "lucide-react";
import { useState, useId } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Category } from "~/components/features/category";
import { Heading } from "~/components/ui/heading";
import { IconButton } from "~/components/ui/icon-button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Button } from "~/components/ui/button";
import { useOutletContext } from "react-router";
import type { GuildsContext } from "../../layout";

export const GuildPanel = () => {
  const { guild, isPending, error } = useOutletContext<GuildsContext>();
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [channelFormData, setChannelFormData] = useState({ name: "" });
  const [categoryFormData, setCategoryFormData] = useState({ name: "" });
  const [isHovered, setIsHovered] = useState(false);
  const channelNameId = useId();
  const categoryNameId = useId();
  const navigate = useNavigate();

  const handleChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating channel:", channelFormData);
    setIsChannelDialogOpen(false);
    setChannelFormData({ name: "" });
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating category:", categoryFormData);
    setIsCategoryDialogOpen(false);
    setCategoryFormData({ name: "" });
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  console.log(guild, isPending, error);
  return (
    <div
      className={css({
        color: "text.bright",
        width: "250px",
        bg: "bg.secondary",
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={css({
          borderBottomWidth: "1px",
          borderColor: "border.soft",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingX: "5",
          height: "12",
        })}
      >
        <Heading
          className={css({
            fontSize: "sm",
            color: "text.medium",
          })}
          onClick={() => navigate("/servers/1/settings")}
        >
          MYSERVER
        </Heading>
        <div className={css({ display: "flex", gap: "2" })}>
          <IconButton
            variant="ghost"
            size="sm"
            color="text.medium"
            className={css({
              _hover: {
                bgColor: "bg.tertiary",
                color: "text.bright",
              },
            })}
          >
            <UserRoundPlus
              size={16}
              onClick={() => navigate("/servers/1/invite")}
            />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            color="text.medium"
            className={css({
              _hover: {
                bgColor: "bg.tertiary",
                color: "text.bright",
              },
            })}
          >
            <Settings
              size={16}
              onClick={() => navigate("/servers/1/settings")}
            />
          </IconButton>
        </div>
      </div>

      {guild?.categories?.map((category) => (
        <Category
          key={category.id}
          onChannelSelect={() =>
            navigate(`/servers/${guild.id}/channels/${category.id}`)
          }
          onAddChannel={() =>
            setIsChannelDialogOpen(
              (isChannelDialogOpen) => !isChannelDialogOpen
            )
          }
        >
          <Category.Title>{category.name}</Category.Title>
          {category.channels.map((channel) => (
            <Category.Channel key={channel.id} channel={channel} />
          ))}
        </Category>
      ))}

      {/* カテゴリ作成ボタン（ホバー時表示） */}
      <div
        className={css({
          padding: "4",
          marginTop: "4",
          opacity: isHovered ? 1 : 0,
          transition: isHovered ? "opacity 0.3s ease" : "opacity 0s",
          pointerEvents: isHovered ? "auto" : "none",
        })}
      >
        <button
          onClick={() => setIsCategoryDialogOpen(true)}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "2",
            width: "100%",
            padding: "2",
            fontSize: "xs",
            fontWeight: "medium",
            color: "text.medium",
            background: "transparent",
            border: "none",
            borderRadius: "sm",
            cursor: "pointer",
            transition: "all 0.1s ease",
            _hover: {
              color: "text.bright",
              backgroundColor: "bg.tertiary",
            },
          })}
        >
          <Plus size={14} />
          カテゴリを作成
        </button>
      </div>

      {/* チャンネル作成モーダル */}
      <Dialog.Root
        open={isChannelDialogOpen}
        onOpenChange={(e) => setIsChannelDialogOpen(e.open)}
      >
        <Dialog.Backdrop
          className={css({
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          })}
        />
        <Dialog.Positioner>
          <Dialog.Content
            className={css({
              background: "bg.secondary",
              borderRadius: "md",
              padding: "6",
              width: "400px",
              maxWidth: "90vw",
            })}
          >
            <Dialog.Title
              className={css({
                fontSize: "xl",
                fontWeight: "bold",
                color: "text.bright",
                marginBottom: "4",
              })}
            >
              チャンネルを作成
            </Dialog.Title>

            <form onSubmit={handleChannelSubmit}>
              <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                <Field.Root>
                  <FormLabel htmlFor={channelNameId} color="text.bright">
                    チャンネル名
                  </FormLabel>
                  <Field.Input
                    id={channelNameId}
                    name="name"
                    type="text"
                    required
                    placeholder="チャンネル名を入力してください"
                    value={channelFormData.name}
                    onChange={handleChannelChange}
                    className={css({
                      background: "bg.primary",
                      border: "none",
                      color: "text.bright",
                    })}
                  />
                </Field.Root>

                <div className={css({ display: "flex", gap: "3", justifyContent: "flex-end", marginTop: "4" })}>
                  <Dialog.CloseTrigger asChild>
                    <Button variant="outline" type="button">
                      キャンセル
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button type="submit" disabled={!channelFormData.name.trim()}>
                    作成
                  </Button>
                </div>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* カテゴリ作成モーダル */}
      <Dialog.Root
        open={isCategoryDialogOpen}
        onOpenChange={(e) => setIsCategoryDialogOpen(e.open)}
      >
        <Dialog.Backdrop
          className={css({
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          })}
        />
        <Dialog.Positioner>
          <Dialog.Content
            className={css({
              background: "bg.secondary",
              borderRadius: "md",
              padding: "6",
              width: "400px",
              maxWidth: "90vw",
            })}
          >
            <Dialog.Title
              className={css({
                fontSize: "xl",
                fontWeight: "bold",
                color: "text.bright",
                marginBottom: "4",
              })}
            >
              カテゴリを作成
            </Dialog.Title>

            <form onSubmit={handleCategorySubmit}>
              <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                <Field.Root>
                  <FormLabel htmlFor={categoryNameId} color="text.bright">
                    カテゴリ名
                  </FormLabel>
                  <Field.Input
                    id={categoryNameId}
                    name="name"
                    type="text"
                    required
                    placeholder="カテゴリ名を入力してください"
                    value={categoryFormData.name}
                    onChange={handleCategoryChange}
                    className={css({
                      background: "bg.primary",
                      border: "none",
                      color: "text.bright",
                    })}
                  />
                </Field.Root>

                <div className={css({ display: "flex", gap: "3", justifyContent: "flex-end", marginTop: "4" })}>
                  <Dialog.CloseTrigger asChild>
                    <Button variant="outline" type="button">
                      キャンセル
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button type="submit" disabled={!categoryFormData.name.trim()}>
                    作成
                  </Button>
                </div>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </div>
  );
};
