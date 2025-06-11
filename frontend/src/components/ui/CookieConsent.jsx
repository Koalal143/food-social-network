'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConsentService from "@/services/consent.service";
import { useToast } from "@/hooks/use-toast";
import { ERROR_MESSAGES } from "@/constants/errors";
import { useAuth } from "@/context/AuthContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuth } = useAuth();
  const { toast } = useToast();
  const { hasConsent, isLoading: consentLoading, setConsent } = useCookieConsent();

  useEffect(() => {
    if (consentLoading) return;

    if (!isAuth) {
      if (!hasConsent) {
        setOpen(true);
      }
    } else {
      setOpen(false);
      if (!hasConsent) {
        setConsent(true);
      }
    }
  }, [isAuth, hasConsent, consentLoading, setConsent]);

  const handleConsent = async (isAllowed) => {
    setLoading(true);
    try {
        await ConsentService.sendConsent(isAllowed);
        setConsent(isAllowed);
        setOpen(false);
    } catch (e) {
        toast({
            title: "Ошибка",
            description: ERROR_MESSAGES.cookie_consent_save_failed,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  if (!open ) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] pointer-events-none">
        <div className="pointer-events-auto">
            <Card className="bg-white/90 border border-muted shadow-lg rounded-xl px-4 py-3 w-[320px] flex flex-col items-center">
            <div className="flex flex-col items-center w-full">
                <span className="text-2xl mb-1">🍪</span>
                <CardTitle className="text-center text-base font-semibold mb-1">Cookies</CardTitle>
            </div>
            <CardContent className="p-0 text-center text-xs text-muted-foreground mb-2 w-full">
                <p className="mb-2">
                    Сайт применяет cookie для анализа посещений. Подтвердите согласие на их использование.
                </p>
                <Link href="/docs/cookies" className="text-blue-600 hover:text-blue-800 underline">
                    Управление куки-файлами
                </Link>
            </CardContent>
            <CardFooter className="flex gap-2 justify-center p-0 w-full">
                <Button
                    onClick={() => handleConsent(true)}
                    disabled={loading}
                    className="h-7 px-3 text-xs rounded-md"
                >
                    Да
                </Button>
                <Button
                    onClick={() => handleConsent(false)}
                    disabled={loading}
                    variant="outline"
                    className="h-7 px-3 text-xs rounded-md"
                >
                    Нет
                </Button>
            </CardFooter>
            </Card>
        </div>
    </div>
  );
} 