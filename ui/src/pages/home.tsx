import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Share2, BookOpen, Plus, Shield, Clock, Users } from "lucide-react";
import iexecLogo from "@/assets/iexec-logo.png";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ConnectWallet from "@/components/wallet/connectWallet";
import { useWallet } from "@/hooks/wallet/useWallet";
import { getDataProtector } from "@/lib/utils";
import { toast } from "sonner";

const Home = () => {
  const [currentView, setCurrentView] = useState("home");

  type Moment = {
    id: string;
    type: string;
    title: string;
    message: string;
    hasPhoto: boolean;
    photo: File | null;
    date: string;
    protectedDataAddress?: string;
    creationTimestamp?: number;
    transactionHash?: string;
  };

  type SharedMoment = {
    id: string;
    protectedDataAddress: string;
    title: string;
    author: string;
    emoji: string;
    grantedAt: string;
  };

  const [moments, setMoments] = useState<Moment[]>([]);
  const [sharedMoments, setSharedMoments] = useState<SharedMoment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMoments, setIsLoadingMoments] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState("");
  const [selectedSharedMoments, setSelectedSharedMoments] = useState<string[]>([]);
  const { address } = useWallet();
  const { connector } = useWallet();

  // Charger mes souvenirs protégés
  useEffect(() => {
    const loadMyProtectedMoments = async () => {
      if (!connector) return;

      setIsLoadingMoments(true);
      try {
        const dataProtector = await getDataProtector(connector);
        const dataProtectorCore = dataProtector.core;

        const protectedDataList = await dataProtectorCore.getProtectedData({
          owner: connector.account,
          pageSize: 100
        });

        const loadedMoments: Moment[] = protectedDataList.map((protectedData) => ({
          id: protectedData.address,
          type: protectedData.name?.includes('Anniversaire') ? 'anniversaire' :
            protectedData.name?.includes('Voyage') ? 'voyage' :
              protectedData.name?.includes('Naissance') ? 'naissance' :
                protectedData.name?.includes('Sortie') ? 'sortie' : 'sortie',
          title: protectedData.name?.replace('Souvenir: ', '') || 'Souvenir sans titre',
          message: 'Données protégées et chiffrées',
          hasPhoto: false,
          photo: null,
          date: new Date(protectedData.creationTimestamp * 1000).toLocaleDateString("fr-FR"),
          protectedDataAddress: protectedData.address,
          creationTimestamp: protectedData.creationTimestamp,
          transactionHash: protectedData.transactionHash,
        }));

        setMoments(loadedMoments);
      } catch (error) {
        console.error('Erreur lors du chargement de mes souvenirs:', error);
        toast.error("Erreur de chargement", {
          description: "Impossible de charger vos souvenirs protégés",
        });
      } finally {
        setIsLoadingMoments(false);
      }
    };

    loadMyProtectedMoments();
  }, [connector]);

  // Charger les souvenirs partagés avec moi
  useEffect(() => {
    const loadSharedMoments = async () => {
      if (!connector) return;

      try {
        const dataProtector = await getDataProtector(connector);
        const dataProtectorCore = dataProtector.core;

        const grantedAccessList = await dataProtectorCore.getGrantedAccess({
          authorizedUser: address,
          isUserStrict: true,
          pageSize: 100,
        });

        const loadedSharedMoments: SharedMoment[] =
          grantedAccessList.grantedAccess.map((grantedAccess, index) => ({
            id: grantedAccess.dataset,
            protectedDataAddress: grantedAccess.dataset,
            title: `Souvenir partagé ${index + 1}`,
            author: grantedAccess.owner || "Inconnu",
            emoji: "📤",
            grantedAt: new Date().toLocaleDateString("fr-FR"),
          }));

        setSharedMoments(loadedSharedMoments);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des souvenirs partagés:",
          error
        );
      }
    };

    loadSharedMoments();
  }, [connector]);

  const [newMoment, setNewMoment] = useState({
    type: "",
    title: "",
    message: "",
    hasPhoto: false,
    photo: null as File | null,
  });

  const [shareData, setShareData] = useState({
    selectedMoment: "",
    walletAddress: "",
  });

  const types = [
    { id: "anniversaire", name: "Anniversaire", emoji: "🎂" },
    { id: "voyage", name: "Voyage", emoji: "✈️" },
    { id: "naissance", name: "Naissance", emoji: "👶" },
    { id: "sortie", name: "Sortie", emoji: "🎉" },
  ];

  // Fonction pour convertir un fichier en ArrayBuffer
  const createArrayBufferFromFile = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Créer un souvenir protégé
  const createMoment = async () => {
    if (!newMoment.type || !newMoment.title || !newMoment.message) return;
    if (!connector) {
      toast.error("Wallet requis", {
        description: "Connectez votre wallet pour créer un souvenir protégé",
      });
      return;
    }

    setIsLoading(true);
    setProtectionStatus("Préparation des données...");

    try {
      let dataToProtect: any = {
        type: newMoment.type,
        title: newMoment.title,
        message: newMoment.message,
        createdAt: new Date().toISOString(),
        hasPhoto: newMoment.hasPhoto,
      };

      if (newMoment.hasPhoto && newMoment.photo) {
        const photoBuffer = await createArrayBufferFromFile(newMoment.photo);
        dataToProtect.photo = photoBuffer;
        dataToProtect.photoName = newMoment.photo.name;
        dataToProtect.photoType = newMoment.photo.type;
      }

      const dataProtector = await getDataProtector(connector);
      const dataProtectorCore = dataProtector.core;

      const protectedData = await dataProtectorCore.protectData({
        name: `Souvenir: ${newMoment.title}`,
        data: {
          memories: `{"v":"1","datetime":"2025-06-26","location":"Lyon, France","images":{"0":"https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg","1":"https://www.udel.edu/academics/colleges/canr/cooperative-extension/fact-sheets/building-strong-family-relationships/_jcr_content/par_udel/columngenerator/par_1/image.coreimg.jpeg/1718801838338/family.jpeg"},"title":"Hackathon","description":"1ère journée au hackathon, ca démarre fort!","locale":"fr","emotion":"fun"}`,
        },
        onStatusUpdate: ({ title, isDone }) => {
          const statusMessages: { [key: string]: string } = {
            EXTRACT_DATA_SCHEMA: "Analyse du schéma des données...",
            CREATE_ZIP_FILE: "Création du fichier compressé...",
            CREATE_ENCRYPTION_KEY: "Génération de la clé de chiffrement...",
            ENCRYPT_FILE: "Chiffrement du fichier...",
            UPLOAD_ENCRYPTED_FILE: "Upload du fichier chiffré...",
            DEPLOY_PROTECTED_DATA: "Déploiement des données protégées...",
            PUSH_SECRET_TO_SMS: "Sécurisation finale...",
          };

          if (statusMessages[title]) {
            setProtectionStatus(statusMessages[title]);
          }
        },
      });

      const moment: Moment = {
        id: protectedData.address,
        type: newMoment.type,
        title: newMoment.title,
        message: newMoment.message,
        hasPhoto: newMoment.hasPhoto,
        photo: newMoment.photo,
        date: new Date().toLocaleDateString("fr-FR"),
        protectedDataAddress: protectedData.address,
        creationTimestamp: protectedData.creationTimestamp,
        transactionHash: protectedData.transactionHash,
      };

      setMoments((prevMoments) => [...prevMoments, moment]);

      toast.success("Souvenir protégé créé !", {
        description: `${newMoment.title} est maintenant sécurisé sur iExec`,
        duration: 5000,
      });

      setNewMoment({
        type: "",
        title: "",
        message: "",
        hasPhoto: false,
        photo: null,
      });
      setCurrentView("home");
    } catch (error) {
      console.error("Erreur lors de la création du souvenir:", error);
      toast.error("Erreur de création", {
        description: `Impossible de créer le souvenir: ${error.message || error}`,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      setProtectionStatus("");
    }
  };

  // Partager un souvenir avec grantAccess
  const shareMoment = async () => {
    if (!shareData.selectedMoment || !shareData.walletAddress || !connector) {
      toast.error("Données manquantes", {
        description: "Veuillez sélectionner un souvenir et une adresse wallet",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dataProtector = await getDataProtector(connector);
      const dataProtectorCore = dataProtector.core;

      await dataProtectorCore.grantAccess({
        protectedData: shareData.selectedMoment,
        authorizedApp: "0xa473C0B2E9697C1C3b1e3779F32D3efa5060b5A9", // App par défaut
        authorizedUser: "0x98136F1b5FB37FB64fFfcD25Ff0e30c57391d255",
        numberOfAccess: 100,
      });

      toast.success("Souvenir partagé !", {
        description: `Accès accordé à ${shareData.walletAddress.slice(0, 10)}...`,
        duration: 4000,
      });

      setShareData({ selectedMoment: "", walletAddress: "" });
      setCurrentView("home");
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Erreur de partage", {
        description: `Impossible de partager: ${error.message || error}`,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer toutes les fonctions de consommation
  // consumeProtectedData, createImageUrl supprimées

  // Fonction pour gérer l'upload de photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewMoment({ ...newMoment, photo: file });
    }
  };

  // Générer un magazine avec processProtectedData
  const generateMagazine = async () => {
    if (selectedSharedMoments.length === 0) {
      toast.error("Aucun souvenir sélectionné", {
        description: "Veuillez sélectionner au moins un souvenir pour générer le magazine",
      });
      return;
    }

    if (!connector) {
      toast.error("Wallet requis", {
        description: "Connectez votre wallet pour générer le magazine",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dataProtector = await getDataProtector(connector);
      const dataProtectorCore = dataProtector.core;

      const selectedMomentsData = sharedMoments.filter(
        moment => selectedSharedMoments.includes(moment.id)
      );

      toast.loading("Génération du magazine...", {
        description: `Traitement de ${selectedMomentsData.length} souvenir(s)`,
        id: "magazine-progress",
      });

      const processedResults = [];

      for (let i = 0; i < selectedMomentsData.length; i++) {
        const moment = selectedMomentsData[i];

        toast.loading(`Traitement ${i + 1}/${selectedMomentsData.length}`, {
          description: `Processing: ${moment.title}`,
          id: "magazine-progress",
        });

        try {
          const processResult = await dataProtectorCore.processProtectedData({
            protectedData: moment.protectedDataAddress,
            app: '0x456def...', // TODO: Remplacer par votre app de génération de magazine
            args: `--format=magazine --title="${moment.title}" --author="${moment.author}"`,
            onStatusUpdate: ({ title, isDone }) => {
              const statusMessages: { [key: string]: string } = {
                'FETCH_PROTECTED_DATA_ORDERBOOK': 'Accès aux données...',
                'FETCH_APP_ORDERBOOK': 'Chargement de l\'app magazine...',
                'FETCH_WORKERPOOL_ORDERBOOK': 'Recherche du workerpool...',
                'PUSH_REQUESTER_SECRET': 'Configuration...',
                'REQUEST_TO_PROCESS_PROTECTED_DATA': 'Demande de traitement...',
                'CONSUME_TASK': 'Génération en cours...',
                'CONSUME_RESULT_DOWNLOAD': 'Récupération du magazine...',
                'CONSUME_RESULT_DECRYPT': 'Finalisation...',
              };

              if (statusMessages[title] && !isDone) {
                toast.loading(`${moment.title}`, {
                  description: statusMessages[title],
                  id: "magazine-progress",
                });
              }
            },
          });

          processedResults.push({
            moment: moment,
            result: processResult,
            success: true
          });

        } catch (error) {
          console.error(`Erreur lors du traitement de ${moment.title}:`, error);
          processedResults.push({
            moment: moment,
            error: error.message || error,
            success: false
          });
        }
      }

      toast.loading("Assemblage du magazine...", {
        description: "Compilation des résultats",
        id: "magazine-progress",
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const successCount = processedResults.filter(r => r.success).length;
      const failureCount = processedResults.length - successCount;

      toast.dismiss("magazine-progress");

      if (successCount > 0) {
        toast.success("Magazine généré !", {
          description: `📖 ${successCount} souvenir(s) traité(s)${failureCount > 0 ? ` • ${failureCount} échec(s)` : ''}`,
          duration: 8000,
          action: {
            label: "Télécharger",
            onClick: () => downloadMagazine(processedResults),
          },
        });

        setSelectedSharedMoments([]);
      } else {
        toast.error("Échec de génération", {
          description: "Aucun souvenir n'a pu être traité",
          duration: 6000,
        });
      }

    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast.error("Erreur de génération", {
        description: `Erreur: ${error.message || error}`,
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger le magazine généré
  const downloadMagazine = (processedResults: any[]) => {
    try {
      const successfulResults = processedResults.filter(r => r.success);

      const magazineData = {
        title: "Magazine de Souvenirs Partagés",
        createdAt: new Date().toISOString(),
        totalSouvenirs: successfulResults.length,
        souvenirs: successfulResults.map(r => ({
          title: r.moment.title,
          author: r.moment.author,
          protectedDataAddress: r.moment.protectedDataAddress,
          taskId: r.result.taskId,
          dealId: r.result.dealId,
          transactionHash: r.result.txHash,
        })),
      };

      const blob = new Blob([JSON.stringify(magazineData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `magazine-souvenirs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.info("Magazine téléchargé", {
        description: "Le magazine a été téléchargé au format JSON",
      });

    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur de téléchargement");
    }
  };

  return (
    <div className="">
      <nav className="border-b border-grey-800 bg-background transition-colors duration-200">
        <div className="mx-0 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src={iexecLogo} alt="iExec Logo" className="h-8 w-auto" />
          </div>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant={currentView === "home" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("home")}
              >
                Accueil
              </Button>
              <Button
                variant={currentView === "create" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("create")}
              >
                Créer
              </Button>
              <Button
                variant={currentView === "share" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("share")}
              >
                Partager
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectWallet />
            <ThemeToggle className="icon-hover" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        {/* Page d'accueil */}
        {currentView === "home" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Vos Souvenirs Protégés</h2>
            </div>

            {/* Mes moments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Mes Souvenirs ({moments.length})
                  {isLoadingMoments && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                      Chargement...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMoments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-600">
                      Récupération de vos souvenirs protégés...
                    </p>
                  </div>
                ) : moments.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {connector ? "Aucun souvenir protégé" : "Connectez votre wallet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moments.map((moment) => (
                      <div
                        key={moment.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {types.find((t) => t.id === moment.type)?.emoji}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{moment.title}</p>
                                <Shield className="h-4 w-4 text-green-600" title="Données protégées par iExec" />
                              </div>
                              <p className="text-sm text-gray-600">
                                {moment.date}
                              </p>
                              {moment.protectedDataAddress && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {moment.protectedDataAddress.slice(0, 10)}...{moment.protectedDataAddress.slice(-8)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Protégé
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setCurrentView("create")} disabled={!connector}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Souvenir
                </Button>
                {moments.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView("share")}
                    disabled={!connector}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                )}
              </div>
            </Card>

            {/* Souvenirs reçus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Souvenirs Reçus ({sharedMoments.length})
                  {
                    <Button
                      onClick={generateMagazine}
                      disabled={isLoading || selectedSharedMoments.length === 0}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {isLoading ? "Génération..." : `Créer Magazine (${selectedSharedMoments.length})`}
                    </Button>
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sharedMoments.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      Aucun souvenir partagé avec vous
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Sélectionnez les souvenirs à inclure dans le magazine :
                    </p>
                    {sharedMoments.map((moment) => (
                      <div
                        key={moment.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedSharedMoments.includes(moment.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSharedMoments([...selectedSharedMoments, moment.id]);
                              } else {
                                setSelectedSharedMoments(
                                  selectedSharedMoments.filter(id => id !== moment.id)
                                );
                              }
                            }}
                          />
                          <span className="text-2xl">{moment.emoji}</span>
                          <div>
                            <p className="font-medium">{moment.title}</p>
                            <p className="text-sm text-gray-600">
                              Par {moment.author}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {moment.protectedDataAddress.slice(0, 10)}...{moment.protectedDataAddress.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Users className="h-3 w-3 mr-1" />
                          Partagé
                        </Badge>
                      </div>
                    ))}

                    {sharedMoments.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSharedMoments(sharedMoments.map(m => m.id))}
                        >
                          Tout sélectionner
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSharedMoments([])}
                        >
                          Tout désélectionner
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Créer un moment */}
        {currentView === "create" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Créer un Souvenir
                <Shield className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  value={newMoment.type}
                  onValueChange={(value) =>
                    setNewMoment({ ...newMoment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de souvenir" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.emoji} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Titre du souvenir"
                value={newMoment.title}
                onChange={(e) =>
                  setNewMoment({ ...newMoment, title: e.target.value })
                }
              />

              <Textarea
                placeholder="Décrivez votre souvenir..."
                value={newMoment.message}
                onChange={(e) =>
                  setNewMoment({ ...newMoment, message: e.target.value })
                }
                className="h-24"
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newMoment.hasPhoto}
                  onCheckedChange={(checked) =>
                    setNewMoment({ ...newMoment, hasPhoto: checked === true })
                  }
                />
                <span>Ajouter une photo</span>
              </div>

              {newMoment.hasPhoto && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mb-2"
                  />
                  {newMoment.photo && (
                    <p className="text-sm text-gray-600">
                      Fichier sélectionné: {newMoment.photo.name}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Protection des données avec iExec
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Vos souvenirs seront chiffrés côté client et stockés de manière sécurisée.
                  Seul vous contrôlez l'accès à vos données.
                </p>
              </div>

              {!connector && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Connectez votre wallet pour créer des souvenirs protégés
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("home")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={createMoment}
                  disabled={
                    !newMoment.type ||
                    !newMoment.title ||
                    !newMoment.message ||
                    isLoading ||
                    !connector
                  }
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </div>
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partager */}
        {currentView === "share" && (
          <Card>
            <CardHeader>
              <CardTitle>Partager un Souvenir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Sélectionnez le souvenir à partager :
                </p>
                <Select
                  value={shareData.selectedMoment}
                  onValueChange={(value) =>
                    setShareData({ ...shareData, selectedMoment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un souvenir" />
                  </SelectTrigger>
                  <SelectContent>
                    {moments.map((moment) => (
                      <SelectItem key={moment.id} value={moment.protectedDataAddress || ""}>
                        {types.find((t) => t.id === moment.type)?.emoji} {moment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  Adresse wallet du destinataire :
                </p>
                <Input
                  placeholder="0x..."
                  value={shareData.walletAddress}
                  onChange={(e) =>
                    setShareData({ ...shareData, walletAddress: e.target.value })
                  }
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Le destinataire pourra accéder à ce souvenir et l'inclure dans ses magazines
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("home")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={shareMoment}
                  disabled={
                    !shareData.selectedMoment ||
                    !shareData.walletAddress ||
                    isLoading
                  }
                  className="flex-1"
                >
                  {isLoading ? "Partage..." : "Partager"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay pour la protection des données */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 text-center max-w-md mx-4 border-green-200 shadow-2xl">
              <div className="space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-100 border-t-green-600 mx-auto"></div>
                  <Shield className="h-6 w-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    {currentView === "share" ? "Partage en cours" : "Protection en cours"}
                  </h3>

                  {protectionStatus && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-green-600 animate-pulse" />
                        <span className="text-green-800 dark:text-green-200 font-medium">
                          {protectionStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {currentView === "share"
                      ? "Octroi d'accès sécurisé avec iExec"
                      : "Chiffrement et sécurisation de vos données avec iExec DataProtector"
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;