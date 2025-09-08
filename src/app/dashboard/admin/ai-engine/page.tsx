
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_CLUSTER_DEFINITIONS, MOCK_SCORING_PRESETS } from '@/lib/data/reports';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function AIEngineControlPage() {
  const { toast } = useToast();
  const [clusterDefinitions, setClusterDefinitions] = React.useState(MOCK_CLUSTER_DEFINITIONS);
  const [scoringPresets, setScoringPresets] = React.useState(MOCK_SCORING_PRESETS);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<{ title: string, body: React.ReactNode, onSave: () => void } | null>(null);

  const handleEditPreset = (presetName: keyof typeof MOCK_SCORING_PRESETS) => {
    const presetData = scoringPresets[presetName];
    setModalContent({
      title: `Edit Preset: ${presetName}`,
      onSave: () => {
        toast({ title: "Preset Saved", description: `${presetName} has been updated.` });
        setIsModalOpen(false);
      },
      body: (
        <div className="space-y-4">
          {Object.entries(presetData).map(([cluster, weight]) => (
            <div key={cluster}>
              <Label htmlFor={cluster}>{cluster}</Label>
              <Input id={cluster} type="number" defaultValue={weight} />
            </div>
          ))}
        </div>
      )
    });
    setIsModalOpen(true);
  };


  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Engine Control</CardTitle>
          <CardDescription>Define and edit clusters, parameters, and scoring algorithms.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Clusters & Parameters</CardTitle>
          <CardDescription>Manage the core components of the validation framework.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(clusterDefinitions).map(([clusterName, clusterDef]) => (
              <AccordionItem value={clusterName} key={clusterName}>
                <AccordionTrigger className="text-lg font-semibold">{clusterName}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">{(clusterDef as any).description}</p>
                  <div className="space-y-4 pl-4">
                    {Object.entries((clusterDef as any).parameters).map(([paramName, paramDef]: [string, any]) => (
                      <div key={paramName} className="border-l-2 pl-4">
                        <h4 className="font-medium">{paramName}</h4>
                        <p className="text-sm text-muted-foreground">{paramDef.description}</p>
                        <div className="mt-2 space-y-2 pl-4">
                            {Object.entries(paramDef.subParameters).map(([subParamName, subParamDesc]: [string, any]) => (
                                <div key={subParamName}>
                                    <p className="font-medium text-sm">{subParamName}</p>
                                    <p className="text-xs text-muted-foreground">{subParamDesc.objective}</p>
                                </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Scoring Presets</CardTitle>
          <CardDescription>Manage the weightage presets for idea validation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {Object.entries(scoringPresets).map(([presetName, weights]) => (
                <Card key={presetName}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">{presetName}</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => handleEditPreset(presetName as keyof typeof MOCK_SCORING_PRESETS)}>Edit</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            {Object.entries(weights).map(([cluster, weight]) => (
                                <div key={cluster}>
                                    <span className="text-muted-foreground">{cluster}: </span>
                                    <span className="font-semibold">{weight}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          {modalContent?.body}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={modalContent?.onSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
