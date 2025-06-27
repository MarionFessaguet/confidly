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
import { Camera, Share2, BookOpen, Plus, Shield, Clock, Users, Mail, CheckCircle } from "lucide-react";
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
    emoji: string;
    grantedAt: string;
  };

  const [moments, setMoments] = useState<Moment[]>([]);
  const [sharedMoments, setSharedMoments] = useState<SharedMoment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMoments, setIsLoadingMoments] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState("");
  const [selectedSharedMoments, setSelectedSharedMoments] = useState<string[]>([]);

  // États pour la gestion des emails
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
          owner: connector.account as string,
          pageSize: 100
        });

        // Helper function to determine the type
        function getMomentType(name?: string): string {
          if (!name) {
            return 'autre';
          }
          if (name.includes('Anniversaire')) { return 'anniversaire'; }
          if (name.includes('Voyage')) { return 'voyage'; }
          if (name.includes('Naissance')) { return 'naissance'; }
          if (name.includes('Sortie')) { return 'sortie'; }
          return 'autre';
        }

        const loadedMoments: Moment[] = protectedDataList.map((protectedData) => ({
          id: protectedData.address,
          type: getMomentType(protectedData.name),
          title: protectedData.name?.replace('Souvenir: ', '') || 'Souvenir sans titre',
          message: 'Données protégées et chiffrées',
          hasPhoto: false,
          photo: null,
          date: new Date(protectedData.creationTimestamp * 1000).toLocaleDateString("fr-FR"),
          protectedDataAddress: protectedData.address,
          creationTimestamp: protectedData.creationTimestamp
        }));

        const sortedMoments = [...loadedMoments].sort((a, b) =>
          (b.creationTimestamp ?? 0) - (a.creationTimestamp ?? 0)
        );
        setMoments(sortedMoments);
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
            emoji: "📤",
            grantedAt: new Date().toLocaleDateString("fr-FR"),
          }));
        const sortedSharedMoments = [...loadedSharedMoments].reverse();
        setSharedMoments(sortedSharedMoments);
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

  // Fonction pour convertir l'image en base64
  function imageToBase64(imageFile: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        resolve(event.target?.result ?? null);
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(imageFile);
    });
  }

  // Fonction pour ajouter un email à la liste
  const addEmail = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmailInput("");
    } else if (emailList.includes(email)) {
      toast.error("Email déjà ajouté");
    } else {
      toast.error("Email invalide");
    }
  };

  // Fonction pour supprimer un email de la liste
  const removeEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(email => email !== emailToRemove));
  };

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
      const dataToProtect: any = {
        v: "1",
        datetime: new Date().toISOString(),
        location: "Lyon, France", // TODO: Récupérer la localisation réelle
        images: {},
        title: newMoment.title,
        description: newMoment.message,
        locale: "fr",
        emotion: "fun", // TODO: Ajouter un champ pour l'émotion
      };

      if (newMoment.hasPhoto && newMoment.photo) {
        const base64Image = await imageToBase64(newMoment.photo);
        const imageType = newMoment.photo.type;
        dataToProtect.images[0] = `data:${imageType};base64,` + base64Image;
      }

      const dataProtector = await getDataProtector(connector);
      const dataProtectorCore = dataProtector.core;

      const protectedData = await dataProtectorCore.protectData({
        name: `Souvenir: ${newMoment.title}`,
        data: {
          memories: JSON.stringify(dataToProtect),
        },
        onStatusUpdate: ({ title }) => {
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

      setMoments((prevMoments) => [moment, ...prevMoments]);

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
        authorizedApp: "0xec43236C58f92412c921A334124Ce3ff6Ee8CE18", // App par défaut
        authorizedUser: shareData.walletAddress,
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

  // Fonction pour gérer l'upload de photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewMoment({ ...newMoment, photo: file });
    }
  };

  // Fonction pour ouvrir la modal d'emails
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

    // Ouvrir la modal pour saisir les emails
    setShowEmailModal(true);
  };

  // Nouvelle fonction pour confirmer la génération avec emails
  const confirmGenerateMagazine = async () => {
    if (emailList.length === 0) {
      toast.error("Aucun email ajouté", {
        description: "Veuillez ajouter au moins une adresse email pour partager le magazine",
      });
      return;
    }

    setShowEmailModal(false);
    setIsLoading(true);

    try {
      const dataProtector = await getDataProtector(connector);
      const dataProtectorCore = dataProtector.core;

      const selectedMomentsData = sharedMoments.filter(
        moment => selectedSharedMoments.includes(moment.id)
      );

      toast.loading("Génération du magazine...", {
        description: `Traitement de ${selectedMomentsData.length} souvenir(s) pour ${emailList.length} destinataire(s)`,
        id: "magazine-progress",
      });

      const processedResults: any[] = [];

      for (let i = 0; i < selectedMomentsData.length; i++) {
        const moment = selectedMomentsData[i];

        toast.loading(`Traitement ${i + 1}/${selectedMomentsData.length}`, {
          description: `Processing: ${moment.title}`,
          id: "magazine-progress",
        });

        try {
          // Préparer les arguments avec les emails de destination
          const emailsArg = emailList.join(',');

          const processResult = await dataProtectorCore.processProtectedData({
            protectedData: moment.protectedDataAddress,
            app: '0xf1612a3EbbB8f9b51B12DA9aAF21ecB8218465BC',
            workerpool: 'tdx-labs.pools.iexec.eth',
            args: `${emailsArg}`,

            onStatusUpdate: ({ title, isDone }) => {
              const statusMessages: { [key: string]: string } = {
                'FETCH_PROTECTED_DATA_ORDERBOOK': 'Accès aux données...',
                'FETCH_APP_ORDERBOOK': 'Chargement de l\'app magazine...',
                'FETCH_WORKERPOOL_ORDERBOOK': 'Recherche du workerpool...',
                'PUSH_REQUESTER_SECRET': 'Configuration...',
                'REQUEST_TO_PROCESS_PROTECTED_DATA': 'Traitement dans l\'enclave sécurisée...',
                'CONSUME_TASK': 'Génération du magazine et enrichissement du contenu...',
                'CONSUME_RESULT_DOWNLOAD': 'Récupération du magazine personnalisé...',
                'CONSUME_RESULT_DECRYPT': 'Finalisation et préparation pour envoi...',
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
            emails: emailList,
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

      toast.loading("Finalisation et envoi des magazines...", {
        description: `Envoi vers ${emailList.length} destinataire(s)`,
        id: "magazine-progress",
      });

      // Simulation de l'envoi d'emails
      await new Promise(resolve => setTimeout(resolve, 2000));

      const successCount = processedResults.filter(r => r.success).length;

      toast.dismiss("magazine-progress");

      if (successCount > 0) {
        // Afficher la modal de succès
        setShowSuccessModal(true);

        // Réinitialiser les sélections
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
                color="#c1cdf6"
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

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>Triés du plus récent au plus ancien</span>
                    </div>

                    {moments.map((moment, index) => (
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
                <Button color="#c1cdf6" onClick={() => setCurrentView("create")} disabled={!connector}>
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
                  <span className="font-medium">
                    Protection des données avec iExec
                  </span>
                </div>
                <p className="text-sm ">
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
                <p className="text-sm">
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

        {/* Modal pour saisir les emails */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 max-w-2xl mx-4 w-full max-h-[80vh] overflow-y-auto border-blue-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-grey-300 text-grey-900">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Partager le Magazine
                </CardTitle>
                <p className="text-sm text-grey-800 dark:text-grey-400 mt-1">
                  Ajoutez les adresses emails des personnes avec qui vous souhaitez partager ce magazine personnalisé.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Info sur le traitement */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Traitement sécurisé dans l'enclave
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Vos souvenirs seront traités de manière confidentielle dans une enclave sécurisée.
                        L'application analysera l'émotion de vos souvenirs, choisira le thème approprié
                        et rédigera un magazine personnalisé avant de l'envoyer aux destinataires.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sélection des souvenirs */}
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-grey-300 dark:text-gray-200">Souvenirs sélectionnés ({selectedSharedMoments.length}) :</h4>
                  <div className="flex flex-wrap gap-2  text-grey-800 dark:text-grey-200">
                    {sharedMoments
                      .filter(moment => selectedSharedMoments.includes(moment.id))
                      .map(moment => (
                        <Badge key={moment.id} variant="outline" className="text-xs text-grey-800 dark:text-grey-500">
                          {moment.emoji} {moment.title}
                        </Badge>
                      ))
                    }
                  </div>
                </div>

                {/* Ajout d'email */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addEmail();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={addEmail} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {/* Liste des emails ajoutés */}
                  {emailList.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Destinataires ({emailList.length}) :
                      </h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2">
                        {emailList.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-mono">{email}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmail(email)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {emailList.length === 0 && (
                  <div className="text-center py-4 text-grey-300 text-sm">
                    Aucun destinataire ajouté. Ajoutez au moins une adresse email.
                  </div>
                )}
              </CardContent>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailList([]);
                    setEmailInput("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmGenerateMagazine}
                  disabled={emailList.length === 0}
                  className="min-w-[140px]"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Générer & Envoyer
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de succès */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-8 max-w-md mx-4 text-center border-green-200 shadow-2xl">
              <div className="space-y-6">
                <div className="relative">
                  <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Mail className="h-8 w-8 text-green-600 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                    Magazine Généré avec Succès !
                  </h3>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-300 text-sm leading-relaxed">
                      Votre magazine personnalisé a été créé et envoyé avec succès à {emailList.length} destinataire{emailList.length > 1 ? 's' : ''}.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800 dark:text-blue-200">
                        Vérifiez vos emails !
                      </span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Le magazine enrichi avec vos souvenirs et adapté selon les émotions détectées
                      a été envoyé aux adresses email suivantes :
                    </p>
                    <div className="mt-2 space-y-1">
                      {emailList.map((email, index) => (
                        <div key={index} className="text-xs font-mono text-blue-600 dark:text-blue-400">
                          📧 {email}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setEmailList([]);
                  }}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Parfait !
                </Button>
              </div>
            </Card>
          </div>
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