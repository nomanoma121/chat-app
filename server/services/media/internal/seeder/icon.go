package seeder

import (
	"context"
	"fmt"
	"io"
	"media-service/internal/constants"
	"media-service/internal/handler"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const (
	userIconDir  = "assets/user-icons/"
	guildIconDir = "assets/guild-icons/"
)

type MediaRepository interface {
	GeneratePresignedURL(context.Context, handler.GeneratePresignedURLParams) (string, error)
}

type Seeder struct {
	mediaRepo MediaRepository
}

func NewSeeder(mediaRepo MediaRepository) *Seeder {
	return &Seeder{
		mediaRepo: mediaRepo,
	}
}

func (s *Seeder) SeedUserIcons(ctx context.Context) error {
	icons := []string{
		"user-blue.png",
		"user-gray.png",
		"user-green.png",
		"user-yellow.png",
		"user-red.png",
	}

	for _, icon := range icons {
		filePath := filepath.Join(userIconDir, icon)
		objectKey := constants.USER_ICON_PATH + icon

		presignedURL, err := s.mediaRepo.GeneratePresignedURL(ctx, handler.GeneratePresignedURLParams{
			ObjectKey: objectKey,
			Expires:   15 * time.Minute,
		})
		if err != nil {
			return fmt.Errorf("failed to generate presigned URL for %s: %w", icon, err)
		}

		if err := uploadToStorage(filePath, presignedURL); err != nil {
			return fmt.Errorf("failed to upload %s: %w", icon, err)
		}

		fmt.Printf("Successfully uploaded: %s\n", icon)
	}

	return nil
}

func (s *Seeder) SeedGuildIcons(ctx context.Context) error {
	icons := []string{
		"guild-gray.png",
	}

	for _, icon := range icons {
		filePath := filepath.Join(guildIconDir, icon)
		objectKey := constants.GUILD_ICON_PATH + icon

		presignedURL, err := s.mediaRepo.GeneratePresignedURL(ctx, handler.GeneratePresignedURLParams{
			ObjectKey: objectKey,
			Expires:   15 * time.Minute,
		})
		if err != nil {
			return fmt.Errorf("failed to generate presigned URL for %s: %w", icon, err)
		}

		if err := uploadToStorage(filePath, presignedURL); err != nil {
			return fmt.Errorf("failed to upload %s: %w", icon, err)
		}

		fmt.Printf("Successfully uploaded: %s\n", icon)
	}
	return nil
}

func uploadToStorage(filePath, presignedURL string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer func() { _ = file.Close() }()

	fileInfo, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to get file info: %w", err)
	}

	req, err := http.NewRequest("PUT", presignedURL, file)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.ContentLength = fileInfo.Size()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("upload failed: status=%d, body=%s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
