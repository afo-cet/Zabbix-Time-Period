<?php

class WidgetTimePeriod extends CControllerDashboardWidgetView {

    protected function init() {
        // Ensure default fields exist in $this->data for view/edit
        $this->data += [
            'follow_dashboard_time' => (bool)($this->config['follow_dashboard_time'] ?? true),
            'fallback_from' => (string)($this->config['fallback_from'] ?? 'now-1h'),
            'fallback_to'   => (string)($this->config['fallback_to']   ?? 'now')
        ];
    }

    public function checkInput() {
        // Accept any string for now-… syntax and boolean; you can harden with regex if you like.
        return true;
    }

    public function getTemplate() {
        return 'widget.time_period.view';
    }
}