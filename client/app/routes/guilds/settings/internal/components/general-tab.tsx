import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Upload } from "lucide-react";
import { Heading } from "~/components/ui/heading";
import { Textarea } from "~/components/ui/textarea";
import { Text } from "~/components/ui/text";

export const GeneralTab = () => {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Card.Root
        className={css({
          background: "bg.secondary",
        })}
      >
        <Card.Header>
          <Heading
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "text.bright",
              marginBottom: "8px",
            })}
          >
            サーバー概要
          </Heading>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            サーバーの基本情報を編集できます
          </Text>
        </Card.Header>

        <Card.Body
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          })}
        >
          {/* サーバーアイコン */}
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "16px",
            })}
          >
            <Avatar
              name="開発チーム"
              size="lg"
              className={css({
                width: "64px",
                height: "64px",
              })}
            />
            <Button
              variant="outline"
              className={css({
                display: "flex",
                alignItems: "center",
                bgColor: "bg.tertiary",
                color: "text.medium",
                _hover: {
                  bgColor: "bg.quaternary",
                  color: "text.bright",
                },
                paddingX: "12px",
                paddingY: "8px",
                fontSize: "sm",
                gap: "8px",
              })}
            >
              <Upload size={16} />
              アイコンを変更
            </Button>
          </div>

          {/* サーバー名 */}
          <Field.Root>
            <FormLabel color="text.bright">サーバー名</FormLabel>
            <Field.Input
              defaultValue="開発チーム"
              className={css({
                borderColor: "border.soft",
                color: "text.bright",
                _hover: {
                  borderColor: "accent.default",
                },
              })}
            />
          </Field.Root>

          <Field.Root>
            <FormLabel color="text.bright">サーバー説明</FormLabel>
            <Field.Textarea
              defaultValue="フルスタック開発チームのサーバーです"
              rows={3}
              className={css({
                borderColor: "border.soft",
                color: "text.bright",
                resize: "none",
                _hover: { borderColor: "accent.default" },
              })}
            />
          </Field.Root>

          {/* サーバー統計 */}
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginTop: "8px",
            })}
          >
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
              })}
            >
              <span
                className={css({
                  fontSize: "2xl",
                  fontWeight: "bold",
                  color: "accent.default",
                })}
              >
                42人
              </span>
              <span
                className={css({
                  fontSize: "sm",
                  color: "text.medium",
                })}
              >
                メンバー数
              </span>
            </div>
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
              })}
            >
              <span
                className={css({
                  fontSize: "2xl",
                  fontWeight: "bold",
                  color: "text.bright",
                })}
              >
                2024/1/10
              </span>
              <span
                className={css({
                  fontSize: "sm",
                  color: "text.medium",
                })}
              >
                作成日
              </span>
            </div>
          </div>

          <Button
            className={css({
              marginTop: "8px",
            })}
          >
            変更を保存
          </Button>
        </Card.Body>
      </Card.Root>

      <Card.Root
        className={css({
          background: "bg.secondary",
          marginY: "24px",
        })}
      >
        <Card.Header>
          <h3
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "danger.default",
              marginBottom: "8px",
            })}
          >
            危険な操作
          </h3>
          <p
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            これらの操作は元に戻せません
          </p>
        </Card.Header>

        <Card.Body>
          <Button
            variant="outline"
            className={css({
              color: "text.bright",
              bgColor: "danger.default",
              _hover: {
                bgColor: "danger.emphasized",
                color: "text.bright",
              },
            })}
          >
            サーバーを削除
          </Button>
        </Card.Body>
      </Card.Root>
    </div>
  );
};
