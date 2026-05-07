import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateProjectModal from "@/components/CreateProjectModal";

export interface Project {
  id: string;
  customerName: string;
  contactNo: string;
  location: string;
  productDescription: string;
  hsnNo: string;
  amount: number;
  createdAt: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("crm_projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("crm_projects", JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (newProject: Omit<Project, "id" | "createdAt">) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString(),
    };
    setProjects([project, ...projects]);
    setIsModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Projects</h1>
              <p className="text-muted-foreground">
                Create and manage your EV bike sales projects with retailers.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </div>

          {/* Projects Table */}
          {projects.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="space-y-4 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold">No projects yet</h2>
                <p className="text-muted-foreground">
                  Create your first project to start tracking EV bike sales opportunities.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Contact No
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Product Description
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      HSN No.
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{project.customerName}</td>
                      <td className="px-6 py-4">{project.contactNo}</td>
                      <td className="px-6 py-4">{project.location}</td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {project.productDescription}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {project.hsnNo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-success">
                        {formatAmount(project.amount)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {project.createdAt}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link to={`/invoice/${project.id}`}>
                            <button className="inline-flex items-center gap-2 text-primary hover:text-primary/90 transition-colors font-medium text-sm">
                              <FileText className="w-4 h-4" />
                              Invoice
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="inline-flex items-center gap-2 text-destructive hover:text-destructive/90 transition-colors font-medium text-sm"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </Layout>
  );
}
