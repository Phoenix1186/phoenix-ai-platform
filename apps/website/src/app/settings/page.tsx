"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Switch, Slider, Select } from "@phoenix/ui";
import { Flame, ArrowLeft, Moon, Sun, Globe, Bell } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-5 w-5 text-slate-500" /> : <Sun className="h-5 w-5 text-slate-500" />}
                  <div>
                    <div className="font-medium text-slate-900">Dark Mode</div>
                    <div className="text-sm text-slate-500">Toggle dark mode for the interface</div>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">Language</div>
                    <div className="text-sm text-slate-500">Select your preferred language</div>
                  </div>
                </div>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { value: "en", label: "English" },
                    { value: "fr", label: "French" },
                    { value: "es", label: "Spanish" },
                    { value: "de", label: "German" },
                    { value: "zh", label: "Chinese" },
                    { value: "ar", label: "Arabic" },
                  ]}
                  className="w-40"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="font-medium text-slate-900">Email Notifications</div>
                    <div className="text-sm text-slate-500">Receive updates about your account</div>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Chat Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Temperature</label>
                  <span className="text-sm text-slate-500">{temperature}</span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Lower values make responses more focused and deterministic.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Max Tokens</label>
                  <span className="text-sm text-slate-500">{maxTokens}</span>
                </div>
                <Slider
                  min={256}
                  max={8192}
                  step={256}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Maximum number of tokens to generate in responses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
