"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";
import { BancoEjercicios } from "@/features/profe/pages/BancoEjercicios";
import { GestionAlimentos } from "@/features/profe/pages/GestionAlimentos";
import { GestionTutoriales } from "@/features/profe/pages/GestionTutoriales";
import {
  profeCatalogoAlimentosRoute,
  profeCatalogoTutorialesRoute,
  profeRoutes,
} from "@/routes/paths";

type CatalogoTab = "ejercicios" | "alimentos" | "tutoriales";

function getTabFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): CatalogoTab {
  const tab = searchParams.get("tab");
  if (tab === "alimentos") return "alimentos";
  if (tab === "tutoriales") return "tutoriales";
  return "ejercicios";
}

export function CatalogoView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getTabFromSearchParams(searchParams);
  const ejerciciosRefetchRef = useRef<() => void>(() => {});
  const alimentosRefetchRef = useRef<() => void>(() => {});
  const tutorialesRefetchRef = useRef<() => void>(() => {});
  const [ejerciciosCount, setEjerciciosCount] = useState<number | undefined>();
  const [alimentosCount, setAlimentosCount] = useState<number | undefined>();
  const [tutorialesCount, setTutorialesCount] = useState<number | undefined>();
  const [ejerciciosCountLoading, setEjerciciosCountLoading] = useState(true);
  const [alimentosCountLoading, setAlimentosCountLoading] = useState(true);
  const [tutorialesCountLoading, setTutorialesCountLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("tab") === "agenda") {
      router.replace(profeRoutes.agenda);
    }
  }, [router, searchParams]);

  function setTab(next: CatalogoTab) {
    if (next === tab) return;

    const href =
      next === "alimentos"
        ? profeCatalogoAlimentosRoute()
        : next === "tutoriales"
          ? profeCatalogoTutorialesRoute()
          : profeRoutes.catalogo;

    router.replace(href);
  }

  const ejerciciosLabel =
    ejerciciosCount === 1 ? "EJERCICIO" : "EJERCICIOS";
  const alimentosLabel = alimentosCount === 1 ? "ALIMENTO" : "ALIMENTOS";
  const tutorialesLabel = tutorialesCount === 1 ? "TUTORIAL" : "TUTORIALES";

  return (
    <div className="page catalogo-page">
      <div className="profe-tabbed-content">
        <ProfeChromeTabs
          ariaLabel="Vista de catálogo"
          tabIdPrefix="catalogo-tab"
          activeTab={tab}
          onTabChange={(next) => setTab(next as CatalogoTab)}
          tabs={[
            {
              id: "ejercicios",
              label: ejerciciosLabel,
              count: ejerciciosCount,
              countLoading: ejerciciosCountLoading,
              controls: "catalogo-panel-ejercicios",
            },
            {
              id: "alimentos",
              label: alimentosLabel,
              count: alimentosCount,
              countLoading: alimentosCountLoading,
              controls: "catalogo-panel-alimentos",
            },
            {
              id: "tutoriales",
              label: tutorialesLabel,
              count: tutorialesCount,
              countLoading: tutorialesCountLoading,
              controls: "catalogo-panel-tutoriales",
            },
          ]}
        />

        {tab === "ejercicios" ? (
          <div
            id="catalogo-panel-ejercicios"
            className="profe-tabbed-content__panel profe-embedded-page"
            role="tabpanel"
            aria-labelledby="catalogo-tab-ejercicios"
          >
            <BancoEjercicios
              embedded
              onRefetchReady={(refetch) => {
                ejerciciosRefetchRef.current = refetch;
              }}
              onCountChange={(count) => {
                setEjerciciosCount(count);
                setEjerciciosCountLoading(false);
              }}
            />
          </div>
        ) : null}

        {tab === "alimentos" ? (
          <div
            id="catalogo-panel-alimentos"
            className="profe-tabbed-content__panel profe-embedded-page"
            role="tabpanel"
            aria-labelledby="catalogo-tab-alimentos"
          >
            <GestionAlimentos
              embedded
              onRefetchReady={(refetch) => {
                alimentosRefetchRef.current = refetch;
              }}
              onCountChange={(count) => {
                setAlimentosCount(count);
                setAlimentosCountLoading(false);
              }}
            />
          </div>
        ) : null}

        {tab === "tutoriales" ? (
          <div
            id="catalogo-panel-tutoriales"
            className="profe-tabbed-content__panel profe-embedded-page"
            role="tabpanel"
            aria-labelledby="catalogo-tab-tutoriales"
          >
            <GestionTutoriales
              embedded
              onRefetchReady={(refetch) => {
                tutorialesRefetchRef.current = refetch;
              }}
              onCountChange={(count) => {
                setTutorialesCount(count);
                setTutorialesCountLoading(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
