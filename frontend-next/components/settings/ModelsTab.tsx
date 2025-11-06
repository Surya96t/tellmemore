"use client";

import { useUiStore } from "@/lib/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS, ModelProvider } from "@/lib/constants/models";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ModelsTab() {
  const { defaultLeftModel, defaultRightModel, setDefaultLeftModel, setDefaultRightModel } = useUiStore();

  // Group models by provider
  const openaiModels = MODELS.filter((m) => m.provider === ModelProvider.OPENAI);
  const googleModels = MODELS.filter((m) => m.provider === ModelProvider.GOOGLE);
  const groqModels = MODELS.filter((m) => m.provider === ModelProvider.GROQ);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Default Models</CardTitle>
          <CardDescription>
            Select the default models to use when starting a new chat session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Left Model */}
          <div className="space-y-3">
            <Label htmlFor="left-model">Left Model (Primary)</Label>
            <Select value={defaultLeftModel} onValueChange={setDefaultLeftModel}>
              <SelectTrigger id="left-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {/* OpenAI Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  OpenAI
                </div>
                {openaiModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}

                {/* Google Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Google
                </div>
                {googleModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}

                {/* Groq Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Groq
                </div>
                {groqModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This model will be selected by default in the left chat panel.
            </p>
          </div>

          <Separator />

          {/* Right Model */}
          <div className="space-y-3">
            <Label htmlFor="right-model">Right Model (Secondary)</Label>
            <Select value={defaultRightModel} onValueChange={setDefaultRightModel}>
              <SelectTrigger id="right-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {/* OpenAI Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  OpenAI
                </div>
                {openaiModels.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    disabled={model.id === defaultLeftModel}
                  >
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}

                {/* Google Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Google
                </div>
                {googleModels.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    disabled={model.id === defaultLeftModel}
                  >
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}

                {/* Groq Models */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  Groq
                </div>
                {groqModels.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    disabled={model.id === defaultLeftModel}
                  >
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.tier && (
                        <Badge variant="outline" className="text-xs">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This model will be selected by default in the right chat panel.
            </p>
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Note</p>
            <p className="text-sm text-muted-foreground">
              These preferences only affect new chat sessions. You can change models at any time during a conversation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
