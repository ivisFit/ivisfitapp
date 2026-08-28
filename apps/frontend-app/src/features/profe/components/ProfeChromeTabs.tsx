"use client";

export type ProfeChromeTab = {
  id: string;
  label: string;
  count?: number;
  countLoading?: boolean;
  controls: string;
};

type ProfeChromeTabsProps = {
  tabs: ProfeChromeTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  ariaLabel: string;
  tabIdPrefix: string;
};

export function ProfeChromeTabs({
  tabs,
  activeTab,
  onTabChange,
  ariaLabel,
  tabIdPrefix,
}: ProfeChromeTabsProps) {
  return (
    <div className="profe-chrome-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabId = `${tabIdPrefix}-${tab.id}`;
        const showCount = tab.count !== undefined || Boolean(tab.countLoading);
        const count = tab.countLoading ? "…" : String(tab.count ?? 0);

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={tabId}
            aria-selected={isActive}
            aria-controls={tab.controls}
            className={`profe-chrome-tabs__tab${isActive ? " is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="profe-chrome-tabs__label">{tab.label}</span>
            {showCount ? (
              <span className="profe-chrome-tabs__count" aria-hidden="true">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
