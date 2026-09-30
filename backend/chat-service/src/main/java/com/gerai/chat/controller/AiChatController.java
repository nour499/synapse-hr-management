package com.gerai.chat.controller;

import com.gerai.chat.dto.AiMessageRequest;
import com.gerai.chat.dto.AiMessageResponse;
import com.gerai.chat.service.ChatbotService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint de l'assistant IA SYNAPSE.
 *
 * Contrat (aligné sur AiChatService du frontend) :
 *   POST /api/chat/ai/message
 *     body  : { "message": string, "history": [ { "role": "user"|"assistant", "content": string } ] }
 *     resp  : { "reply": string, "success": boolean, "error": string }
 */
@Slf4j
@RestController
@RequestMapping("/api/chat/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class AiChatController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<AiMessageResponse> message(
            @RequestBody AiMessageRequest request,
            HttpServletRequest httpRequest) {

        String bearer = httpRequest.getHeader("Authorization");
        if (bearer == null || bearer.isBlank()) bearer = "";

        AiMessageResponse response = chatbotService.answer(
                request.getMessage(),
                request.getHistory(),
                bearer);

        return ResponseEntity.ok(response);
    }
}
