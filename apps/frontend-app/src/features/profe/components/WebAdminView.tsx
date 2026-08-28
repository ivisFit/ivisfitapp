"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { ProfeChromeTabs } from "@/features/profe/components/ProfeChromeTabs";
import { LeadsChatbotPage } from "@/features/profe/pages/LeadsChatbotPage";
import { PlanesLandingAdmin } from "@/features/profe/pages/PlanesLandingAdmin";
import { profeRoutes, profeWebChatbotRoute } from "@/routes/paths";

type WebTab = "landing" | "chatbot";

function getTabFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): WebTab {
  return searchParams.get("tab") === "chatbot" ? "chatbot" : "landing";
}

export function WebAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = getTabFromSearchParams(searchParams);
  const chatbotRefetchRef = useRef<() => void>(() => {});
  const [leadsCount, setLeadsCount] = useState<number | undefined>();
  const [leadsCountLoading, setLeadsCountLoading] = useState(true);

  function setTab(next: WebTab) {
    if (next === tab) return;

    const href =
      next === "chatbot" ? profeWebChatbotRoute() : profeRoutes.webConfig;

    router.replace(href);
  }

  function handleRefresh() {
    if (tab === "chatbot") {
      chatbotRefetchRef.current();
    }
  }

  const chatbotSubtitle =
    "Evaluaciones comerciales completadas desde el chatbot web.";

  const leadsLabel = leadsCount === 1 ? "LEAD" : "LEADS";

  return (
    <div className="page web-admin-page">
      {tab === "chatbot" ? (
        <div className="page__actions">
          <div>
            <p>{chatbotSubtitle}</p>
          </div>
          <Button type="button" variant="ghost" onClick={handleRefresh}>
            Actualizar
          </Button>
        </div>
      ) : null}

      <div className="profe-tabbed-content">
        <ProfeChromeTabs
          ariaLabel="Vista de web"
          tabIdPrefix="web-tab"
          activeTab={tab}
          onTabChange={(next) => setTab(next as WebTab)}
          tabs={[
            {
              id: "landing",
              label: "LANDING",
              controls: "web-panel-landing",
            },
            {
              id: "chatbot",
              label: leadsLabel,
              count: leadsCount,
              countLoading: leadsCountLoading,
              controls: "web-panel-chatbot",
            },
          ]}
        />

        <div
          id="web-panel-landing"
          className="profe-tabbed-content__panel"
          role="tabpanel"
          aria-labelledby="web-tab-landing"
          hidden={tab !== "landing"}
        >
          <PlanesLandingAdmin embedded />
        </div>

        <div
          id="web-panel-chatbot"
          className="profe-tabbed-content__panel profe-embedded-page"
          role="tabpanel"
          aria-labelledby="web-tab-chatbot"
          hidden={tab !== "chatbot"}
        >
          <LeadsChatbotPage
            embedded
            onRefetchReady={(refetch) => {
              chatbotRefetchRef.current = refetch;
            }}
            onCountChange={(count) => {
              setLeadsCount(count);
              setLeadsCountLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
