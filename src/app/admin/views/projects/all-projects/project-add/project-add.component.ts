// project-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-project-page',
  templateUrl: './project-add.component.html',
  standalone : true,
  styleUrls: ['./project-add.component.css'],
})
export class ProjectAddComponent implements OnInit {
  projectId: string = '';
  projectData: any = null;
  isLoading: boolean = true;
  readOnlyMode: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get project ID from route parameters
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.loadProject();
    });
    
    // Check if we're in read-only mode (optional)
    this.route.queryParams.subscribe(params => {
      this.readOnlyMode = params['mode'] === 'view';
    });
  }

  /**
   * Load project data (simulated)
   */
  loadProject(): void {
    this.isLoading = true;
    
    // Simulate API call to get project data
    setTimeout(() => {
      // For a new project, we'd provide empty initial data
      if (this.projectId === 'new') {
        this.projectData = {
          time: new Date().getTime(),
          blocks: [
            {
              type: "header",
              data: {
                text: "New Project",
                level: 2
              }
            },
            {
              type: "paragraph",
              data: {
                text: "Start typing your content here..."
              }
            }
          ]
        };
        this.projectId = 'project_' + Math.floor(Math.random() * 10000);
      } else {
        // For existing projects, load saved data
        // This is where you would make an API call
        this.projectData = this.getSavedProject(this.projectId);
      }
      
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Simulated method to get saved project data
   */
  getSavedProject(id: string): any {
    // In a real app, this would be an API call
    const savedData = localStorage.getItem(`project_${id}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // Return default data if no saved project exists
    return {
      time: new Date().getTime(),
      blocks: [
        {
          type: "header",
          data: {
            text: "Project " + id,
            level: 2
          }
        },
        {
          type: "paragraph",
          data: {
            text: "This is a sample project."
          }
        }
      ]
    };
  }

  /**
   * Handle save event from editor
   */
  onProjectSave(projectData: any): void {
    // Save to localStorage (simulated)
    localStorage.setItem(`project_${this.projectId}`, JSON.stringify(projectData.content));
    
    // Display success message (you might use a toast or notification service)
    console.log('Project saved successfully!');
    
    // You could redirect after saving if needed
    // this.router.navigate(['/projects']);
  }

  /**
   * Handle update event from editor
   */
  onProjectUpdate(): void {
    // This is triggered on every content change
    // You might implement auto-save functionality here
    console.log('Content updated');
  }
}