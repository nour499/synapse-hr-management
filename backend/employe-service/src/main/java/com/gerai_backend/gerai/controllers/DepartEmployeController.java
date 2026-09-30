package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.dto.DepartEmployeDTO;
import com.gerai_backend.gerai.models.DepartEmploye;
import com.gerai_backend.gerai.services.DepartEmployeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/departs")
@RequiredArgsConstructor
public class DepartEmployeController {

    private final DepartEmployeService departEmployeService;

    @PostMapping
    public DepartEmploye createDepartEmploye(@RequestBody DepartEmployeDTO request) {
        return departEmployeService.createDepartEmploye(request);
    }

    @GetMapping
    public List<DepartEmploye> getAllDepartEmployes() {
        return departEmployeService.getAllDepartEmployes();
    }

    @GetMapping({"/{id}", "/{id}/"})
    public DepartEmploye getDepartEmployeById(@PathVariable Long id) {
        return departEmployeService.getDepartEmployeById(id);
    }

    @PutMapping({"/{id}", "/{id}/"})
    public DepartEmploye updateDepartEmploye(@PathVariable Long id, @RequestBody DepartEmployeDTO request) {
        return departEmployeService.updateDepartEmploye(id, request);
    }

    @DeleteMapping({"/{id}", "/{id}/"})
    public void deleteDepartEmploye(@PathVariable Long id) {
        departEmployeService.deleteDepartEmploye(id);
    }
}