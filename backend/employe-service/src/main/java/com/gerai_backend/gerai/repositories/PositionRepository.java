package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, Long> {

    Optional<Position> findByTitleIgnoreCase(String title);
}