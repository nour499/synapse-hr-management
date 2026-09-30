package com.gerai.demandesservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Calcul du nombre de jours ouvrés (lundivendredi, hors week-end)
 * entre deux dates incluses. Utilisé pour le nombre de jours de congé
 * quand l'employé ne le saisit pas explicitement.
 */
@Slf4j
@Service
public class WorkingDayService {

    /**
     * @return nombre de jours ouvrés dans [start, end] (bornes incluses).
     *        0 si start/end null ou start > end.
     */
    public int countWorkingDays(LocalDate start, LocalDate end) {
        if (start == null || end == null || start.isAfter(end)) {
            return 0;
        }
        int count = 0;
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            DayOfWeek dow = cur.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            cur = cur.plusDays(1);
        }
        return count;
    }
}
