import BackButton from "@/components/BackButton";
import ProjectCard from "@/components/ProjectCard"

export default function Projects() {

  return (
    <div>
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="mt-2 text-gray-600">This is the projects page.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard title="Project 1" description="qweqwe porject1 qweqwe" href="/projects/view/Project1?description=Project+1+description&stars=5" />
        <ProjectCard title="Project 2" description="qweqwe porject1 qweqwe" href="/projects/view/Project2?description=Project+2+description&stars=4" />
        <ProjectCard title="Project 3" description="qweqwe porject1 qweqwe" href="/projects/view/Project3?description=Project+3+description&stars=3" />
      </div>
      <BackButton/>
    </div>
  );
}