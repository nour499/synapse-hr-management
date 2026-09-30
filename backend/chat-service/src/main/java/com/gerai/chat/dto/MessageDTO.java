package com.gerai.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;


@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageDTO {
    private Long          messageId;
    private Long          conversationId;
    private Long          senderId;
    private String        senderNom;
    private String        content;
    private String        type;          // TEXTE | IMAGE | FICHIER | SYSTEME
    private String        attachmentUrl;
    private Long          replyToId;
    @JsonProperty("isDeleted")
    private boolean       isDeleted;
    private LocalDateTime sentAt;
    private LocalDateTime editedAt;
    @JsonProperty("luParMoi")
    private boolean       luParMoi;      // true si l'utilisateur courant a lu
}