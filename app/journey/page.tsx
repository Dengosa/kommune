"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, GraduationCap, HeartPulse, Wallet, Clock } from "lucide-react";
import { ProofOfApplicationIphone, type ApplicationRecord } from "@/components/proof-of-application-iphone";

const agents = [
  { icon: ShieldCheck, label: "Legal Assistant (Lex)", value: "Activating" },
  { icon: GraduationCap, label: "Education Assistant", value: "Activating" },
  { icon: HeartPulse, label: "Health Assistant (Vita)", value: "Activating" },
  { icon: Wallet, label: "Credit Assistant (Rex)", value: "Activating" },
];

const demoRecords: ApplicationRecord[] = [
  { type: "Section 22 Permit Renewal", appliedOn: "2026-03-14", status: "Under Review", reference: "HA-22841" },
  { type: "NSFAS Bursary Application", appliedOn: "2026-04-02", status: "Submitted" },
  { type: "FNB Bank Account (no SA ID)", appliedOn: "2026-04-10", status: "Approved" },
];

export default function JourneyPage() {
  return (
    <main className="relative min-h-screen bg-secondary/20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="flex items-start justify-between gap-8">
          <div>
            <div className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Your workspace</div>
            <h1 className="mt-4 text-4xl lg:text-6xl font-display tracking-tight">Your Journey</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
              Technology made for real people. Your assistants activate within 24 hours of payment confirmation.
            </p>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-display">Assistant Status</h2>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {agents.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="rounded-xl border border-foreground/10 bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-foreground/5 inline-flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="text-sm font-medium">{a.label}</div>
                          <div className="font-mono text-xs text-muted-foreground">Status</div>
                        </div>
                      </div>
                      <span className="font-mono text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                        {a.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl border border-foreground/10 p-4 bg-background">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-foreground/80 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Awaiting Payment Confirmation</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Once we confirm your R300 payment, your assistants activate within 24 hours.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-display">What unlocks after activation</h2>
            </div>
            <div className="mt-6 space-y-4">
              {[
                "Legal guidance — visas, permits, your rights",
                "Credit building — banking without SA ID",
                "Health access — clinics, ARVs, your rights",
                "Education — qualifications recognition, NSFAS",
                "Emergency support — detention, violence, deportation",
                "Personal vault — your documents, stored securely",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-foreground/5 inline-flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-foreground" />
                  </span>
                  <div className="text-sm font-medium">{item}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full">
                <Link href="/activate">
                  Complete Payment — R300
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-10 rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8">
          <ProofOfApplicationIphone holderName="Khaya" records={demoRecords} />
        </div>
      </div>
    </main>
  );
}
