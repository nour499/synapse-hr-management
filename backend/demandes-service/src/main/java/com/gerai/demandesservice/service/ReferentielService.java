package com.gerai.demandesservice.service;

import com.gerai.demandesservice.model.*;
import com.gerai.demandesservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReferentielService {

    private final TypeCongeRepository typeCongeRepository;
    private final JourFerieRepository jourFerieRepository;
    private final GrilleSalarialeRepository grilleSalarialeRepository;
    private final CompetenceRepository competenceRepository;

    // ----------------------------------------------------------------------
    // TypeConge methods
    // ----------------------------------------------------------------------

    public List<TypeConge> getAllTypesConge() {
        return typeCongeRepository.findByActifTrue();
    }

    public TypeConge createTypeConge(TypeConge typeConge) {
        return typeCongeRepository.save(typeConge);
    }

    public TypeConge updateTypeConge(Long id, TypeConge typeConge) {
        return typeCongeRepository.findById(id)
            .map(existing -> {
                existing.setCode(typeConge.getCode());
                existing.setLibelle(typeConge.getLibelle());
                existing.setDescription(typeConge.getDescription());
                existing.setNombreJours(typeConge.getNombreJours());
                existing.setPaye(typeConge.getPaye());
                existing.setActif(typeConge.getActif());
                existing.setCouleur(typeConge.getCouleur());
                existing.setIcone(typeConge.getIcone());
                return typeCongeRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("TypeConge non trouvé avec l'id : " + id));
    }

    public void deleteTypeConge(Long id) {
        typeCongeRepository.deleteById(id);
    }

    public TypeConge toggleTypeCongeActif(Long id) {
        return typeCongeRepository.findById(id)
            .map(typeConge -> {
                typeConge.setActif(!typeConge.getActif());
                return typeCongeRepository.save(typeConge);
            })
            .orElseThrow(() -> new RuntimeException("TypeConge non trouvé avec l'id : " + id));
    }

    // ----------------------------------------------------------------------
    // JourFerie methods
    // ----------------------------------------------------------------------

    public List<JourFerie> getAllJoursFeries() {
        return jourFerieRepository.findByRecurrentTrueOrderByDateAsc();
    }

    public JourFerie createJourFerie(JourFerie jourFerie) {
        return jourFerieRepository.save(jourFerie);
    }

    public JourFerie updateJourFerie(Long id, JourFerie jourFerie) {
        return jourFerieRepository.findById(id)
            .map(existing -> {
                existing.setLibelle(jourFerie.getLibelle());
                existing.setDate(jourFerie.getDate());
                existing.setRecurrent(jourFerie.getRecurrent());
                existing.setDescription(jourFerie.getDescription());
                return jourFerieRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("JourFerie non trouvé avec l'id : " + id));
    }

    public void deleteJourFerie(Long id) {
        jourFerieRepository.deleteById(id);
    }

    // ----------------------------------------------------------------------
    // GrilleSalariale methods
    // ----------------------------------------------------------------------

    public List<GrilleSalariale> getAllGrillesSalariales() {
        return grilleSalarialeRepository.findByOrderByNiveau();
    }

    public GrilleSalariale createGrilleSalariale(GrilleSalariale grilleSalariale) {
        return grilleSalarialeRepository.save(grilleSalariale);
    }

    public GrilleSalariale updateGrilleSalariale(Long id, GrilleSalariale grilleSalariale) {
        return grilleSalarialeRepository.findById(id)
            .map(existing -> {
                existing.setNiveau(grilleSalariale.getNiveau());
                existing.setIntitule(grilleSalariale.getIntitule());
                existing.setSalaireMin(grilleSalariale.getSalaireMin());
                existing.setSalaireMax(grilleSalariale.getSalaireMax());
                existing.setSalaireBase(grilleSalariale.getSalaireBase());
                existing.setDevise(grilleSalariale.getDevise());
                existing.setAvantages(grilleSalariale.getAvantages());
                return grilleSalarialeRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("GrilleSalariale non trouvée avec l'id : " + id));
    }

    public void deleteGrilleSalariale(Long id) {
        grilleSalarialeRepository.deleteById(id);
    }

    // ----------------------------------------------------------------------
    // Competence methods
    // ----------------------------------------------------------------------

    public List<Competence> getAllCompetences() {
        return competenceRepository.findByActifTrue();
    }

    public List<Competence> getCompetencesByCategorie(String categorie) {
        return competenceRepository.findByCategorie(categorie);
    }

    public Competence createCompetence(Competence competence) {
        return competenceRepository.save(competence);
    }

    public Competence updateCompetence(Long id, Competence competence) {
        return competenceRepository.findById(id)
            .map(existing -> {
                existing.setNom(competence.getNom());
                existing.setCategorie(competence.getCategorie());
                existing.setDescription(competence.getDescription());
                existing.setActif(competence.getActif());
                return competenceRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("Competence non trouvée avec l'id : " + id));
    }

    public void deleteCompetence(Long id) {
        competenceRepository.deleteById(id);
    }
}
